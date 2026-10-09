# Kubernetes Collector

Install the OpenTelemetry Collector with the upstream Helm chart or Operator. Talaria does not ship an operator. The chart needs the OTLP endpoint and the project API key.

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
    otlphttp:
      endpoint: https://api.newtalaria.com
      headers:
        X-API-Key: ${env:TALARIA_API_KEY}
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
        exporters: [otlphttp]
      metrics:
        exporters: [otlphttp]
```

Add a Deployment-mode Collector for cluster receivers. `k8scluster` supplies pod phase, restarts, and CronJob success. Point that pipeline at the same exporter.

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
                - name: TALARIA_DSN
                  value: https://api.newtalaria.com
                - name: TALARIA_PING_TOKEN
                  valueFrom:
                    secretKeyRef:
                      name: talaria-import
                      key: pingToken
              command:
                - /bin/sh
                - -c
                - |
                  curl -fsS -X POST "$TALARIA_DSN/monitors/ping" \
                    -H "X-Monitor-Token: $TALARIA_PING_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d '{"status":"in_progress"}'
                  /app/import
                  status=$?
                  if [ "$status" -eq 0 ]; then
                    curl -fsS -X POST "$TALARIA_DSN/monitors/ping" \
                      -H "X-Monitor-Token: $TALARIA_PING_TOKEN" \
                      -H "Content-Type: application/json" \
                      -d '{"status":"ok"}'
                  else
                    curl -fsS -X POST "$TALARIA_DSN/monitors/ping" \
                      -H "X-Monitor-Token: $TALARIA_PING_TOKEN" \
                      -H "Content-Type: application/json" \
                      -d '{"status":"error"}'
                  fi
                  exit "$status"
```

Register the monitor from the dashboard or `monitors/checkIn` with `crontab: "0 2 * * *"`, `timezone`, `marginSeconds`, and `maxRuntimeSeconds` before the first run. The ping token comes back once.
