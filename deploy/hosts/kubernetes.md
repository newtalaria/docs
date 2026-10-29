---
id: kubernetes-collector
title: Kubernetes
description: >-
  Deploy the OpenTelemetry Collector on Kubernetes with Helm values and a
  CronJob health check-in.
type: guide
section: deploy
platform: []
feature: []
host: kubernetes
order: 10
lastReviewed: '2026-10-29'
owner: docs
---
# Kubernetes Collector

Install the OpenTelemetry Collector with the upstream Helm chart or Operator. Talaria does not ship an operator. The chart needs the OTLP endpoint and a secret key (`tal_sk_<env>_nz1_…`). OTLP export is HTTP only (`otlp_http`). gRPC is not supported.

```yaml
mode: daemonset
presets:
  logsCollection:
    enabled: true
  kubernetesAttributes:
    enabled: true
  kubeletMetrics:
    enabled: true
config:
  exporters:
    otlp_http:
      endpoint: https://ingest-nz1.newtalaria.com/otlp
      headers:
        Authorization: Bearer ${env:TALARIA_API_KEY}
      compression: gzip
  processors:
    resource:
      attributes:
        - key: service.name
          from_attribute: k8s.deployment.name
          action: insert
    batch: {}
  service:
    pipelines:
      logs:
        exporters: [otlp_http]
      metrics:
        exporters: [otlp_http]
```

Add a Deployment-mode Collector for cluster receivers. `k8s_cluster` supplies pod phase, restarts, and CronJob success. Point that pipeline at the same exporter.

Drop `debug` severity in the Collector. Keep `warn` and `error`.

## CronJob check-in

The job container reports to Talaria. A failed pod that never started is also visible from `k8s.job.failed_pods`.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: import
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: import
              image: example/import:1
              env:
                - name: TALARIA_MONITOR_TOKEN
                  valueFrom:
                    secretKeyRef:
                      name: talaria-import
                      key: monitor-token
              command:
                - /bin/sh
                - -c
                - |
                  curl -fsS -X POST "https://ingest-nz1.newtalaria.com/v1/check-ins" \
                    -H "Authorization: Bearer $TALARIA_MONITOR_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d '{"status":"in_progress"}'
                  /app/import
                  status=$?
                  if [ "$status" -eq 0 ]; then
                    curl -fsS -X POST "https://ingest-nz1.newtalaria.com/v1/check-ins" \
                      -H "Authorization: Bearer $TALARIA_MONITOR_TOKEN" \
                      -H "Content-Type: application/json" \
                      -d '{"status":"ok"}'
                  else
                    curl -fsS -X POST "https://ingest-nz1.newtalaria.com/v1/check-ins" \
                      -H "Authorization: Bearer $TALARIA_MONITOR_TOKEN" \
                      -H "Content-Type: application/json" \
                      -d '{"status":"error"}'
                  fi
                  exit "$status"
```

Register the monitor from the dashboard or `POST /v1/monitors/{slug}/check-ins` with `crontab: "0 2 * * *"`, `timezone`, `marginSeconds`, and `maxRuntimeSeconds` before the first run. The ping token comes back once.
