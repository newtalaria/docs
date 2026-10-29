---
id: kubernetes-collector
title: Kubernetes
description: Deploy the OpenTelemetry Collector on Kubernetes to send traces, logs, and metrics to Talaria.
type: guide
section: deploy-ci
platform: []
feature: []
host: kubernetes
order: 10
lastReviewed: '2026-10-29'
owner: docs
outcome: OpenTelemetry Collector running on Kubernetes, sending traces, logs, and metrics to Talaria
why: Kubernetes logs, pod metrics, and distributed traces need a collector to reach Talaria
notFor:
  - when: You're using a Talaria SDK directly in your app
    href: ../sdk/README.md
prereqs:
  - text: A Kubernetes cluster with kubectl access
  - text: Helm 3 installed
credentials:
  - ingest-key
scopes:
  - logs:write
  - metrics:write
timeMinutes: 15
verify:
  surface: runtime
  path: Projects › <your project> › Runtime
  expect: Service rows appear for your cluster namespaces and deployments
  mcp:
    tool: search_logs
    params:
      service: k8s-collector
      limit: 10
    expect: Log records with k8s.namespace.name and k8s.pod.name attributes
next:
  - monitors
  - runtime
---

# Kubernetes

## What you're setting up

The OpenTelemetry Collector runs as a DaemonSet (logs, kubelet metrics, and trace relay) and optionally as a Deployment (cluster-wide metrics like pod phase and CronJob status). You'll install it with the upstream `opentelemetry-collector` Helm chart, pointing at Talaria's OTLP endpoint.

## Why use this

- **Logs**: Automatically collect container stdout/stderr from all pods
- **Metrics**: Pod CPU, memory, restarts, and CronJob success/failure. **Note**: Gauge alerts use the latest value over 15 minutes. LogRate alerts count error-level logs only (severity ≥ 17), have no environment filter, and filter on service only. Logs and metrics cannot be filtered by environment.
- **Traces**: Relay OTLP traces from instrumented apps to Talaria
- **Resource enrichment**: Attach `k8s.namespace.name`, `k8s.deployment.name`, `k8s.pod.name` to every signal

## Before you start

1. **Get your Talaria ingest key** from Project settings › Client keys. It should start with `tal_prod_` (production), `tal_stg_` (staging), `tal_test_` (test), or `tal_dev_` (development).
2. **Decide your service name**: This will appear in Runtime as the top-level grouping (e.g., `checkout-api`, `background-jobs`).
3. **Have `kubectl` and Helm 3** ready.

## Steps

### 1. Create a Kubernetes Secret for your Talaria key

Store your ingest key as a Secret so the Collector can reference it:

```bash
kubectl create secret generic talaria-ingest \
  --from-literal=api-key=tal_prod_YOUR_KEY_HERE \
  --namespace=opentelemetry-collector
```

Replace `tal_prod_YOUR_KEY_HERE` with your actual key.

### 2. Install the OpenTelemetry Collector Helm chart

Add the OpenTelemetry Helm repository:

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update
```

Create a `values.yaml` file with the Talaria configuration:

```yaml
# values.yaml for opentelemetry-collector
image:
  repository: otel/opentelemetry-collector-contrib
  tag: "0.164.0"

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
      endpoint: https://ingest.newtalaria.com/otlp
      headers:
        x-api-key: ${env:TALARIA_API_KEY}
      compression: gzip

  processors:
    resource:
      attributes:
        - key: service.name
          from_attribute: k8s.deployment.name
          action: insert
    batch: {}
    k8sattributes:
      passthrough: false

  service:
    pipelines:
      traces:
        receivers: [otlp]
        processors: [k8sattributes, resource, batch]
        exporters: [otlp_http]
      logs:
        receivers: [otlp, filelog]
        processors: [k8sattributes, resource, batch]
        exporters: [otlp_http]
      metrics:
        receivers: [otlp, kubeletstats]
        processors: [k8sattributes, resource, batch]
        exporters: [otlp_http]

env:
  - name: TALARIA_API_KEY
    valueFrom:
      secretKeyRef:
        name: talaria-ingest
        key: api-key
  - name: OTEL_SERVICE_NAME
    value: "k8s-collector"
```

Install the chart:

```bash
helm install opentelemetry-collector open-telemetry/opentelemetry-collector \
  --namespace opentelemetry-collector \
  --create-namespace \
  --values values.yaml
```

### 3. (Optional) Install a Deployment-mode Collector for cluster metrics

For cluster-wide metrics (pod phase, CronJob success/failure), add a second Collector in Deployment mode with the `k8s_cluster` receiver:

```yaml
# values-cluster.yaml
image:
  repository: otel/opentelemetry-collector-contrib
  tag: "0.164.0"

mode: deployment

replicaCount: 1

config:
  receivers:
    k8s_cluster:
      auth_type: serviceAccount
      node_conditions_to_report: [Ready, MemoryPressure, DiskPressure]
      allocatable_types_to_report: [cpu, memory, storage]

  exporters:
    otlp_http:
      endpoint: https://ingest.newtalaria.com/otlp
      headers:
        x-api-key: ${env:TALARIA_API_KEY}
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
      metrics:
        receivers: [k8s_cluster]
        processors: [resource, batch]
        exporters: [otlp_http]

env:
  - name: TALARIA_API_KEY
    valueFrom:
      secretKeyRef:
        name: talaria-ingest
        key: api-key

rbac:
  create: true
  rules:
    - apiGroups: [""]
      resources: [events, namespaces, namespaces/status, nodes, nodes/spec, pods, pods/status, replicationcontrollers, replicationcontrollers/status, resourcequotas, services]
      verbs: [get, list, watch]
    - apiGroups: [apps]
      resources: [daemonsets, deployments, replicasets, statefulsets]
      verbs: [get, list, watch]
    - apiGroups: [batch]
      resources: [jobs, cronjobs]
      verbs: [get, list, watch]
```

Install it:

```bash
helm install opentelemetry-cluster open-telemetry/opentelemetry-collector \
  --namespace opentelemetry-collector \
  --values values-cluster.yaml
```

This receiver emits `k8s.job.failed_pods` and `k8s.cronjob.active_jobs`, which you can alert on.

### 4. (Optional) Wire CronJob check-ins to Monitors

For explicit job health tracking beyond metrics, have your CronJob send check-ins to Talaria Monitors. Create a monitor token from the dashboard (Monitors › Create monitor), then add it as a Secret:

```bash
kubectl create secret generic talaria-import-monitor \
  --from-literal=monitor-token=tal_mon_YOUR_TOKEN_HERE \
  --namespace=default
```

Update your CronJob to call the check-in endpoint:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-import
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
                - name: TALARIA_URL
                  value: https://ingest.newtalaria.com
                - name: TALARIA_MONITOR_TOKEN
                  valueFrom:
                    secretKeyRef:
                      name: talaria-import-monitor
                      key: monitor-token
              command:
                - /bin/sh
                - -c
                - |
                  # Send in_progress
                  curl -fsS -X POST "$TALARIA_URL/v1/check-ins" \
                    -H "X-Talaria-Monitor-Token: $TALARIA_MONITOR_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d '{"status":"in_progress"}'
                  
                  # Run the job
                  /app/import
                  status=$?
                  
                  # Send ok or error
                  if [ "$status" -eq 0 ]; then
                    curl -fsS -X POST "$TALARIA_URL/v1/check-ins" \
                      -H "X-Talaria-Monitor-Token: $TALARIA_MONITOR_TOKEN" \
                      -H "Content-Type: application/json" \
                      -d '{"status":"ok"}'
                  else
                    curl -fsS -X POST "$TALARIA_URL/v1/check-ins" \
                      -H "X-Talaria-Monitor-Token: $TALARIA_MONITOR_TOKEN" \
                      -H "Content-Type: application/json" \
                      -d '{"status":"error"}'
                  fi
                  
                  exit "$status"
```

The monitor is created via the dashboard or by sending the first check-in with `crontab`, `timezone`, `marginSeconds`, and `maxRuntimeSeconds` in the body.

## Check it worked

1. **View logs in Runtime**:
   - Go to Projects › <your project> › Runtime
   - You should see service rows for your cluster (grouped by `service.name` which is set from `k8s.deployment.name` via the resource processor)
   - Click a service to see logs

2. **Verify metrics**:
   - Check that `k8s.pod.cpu.utilization`, `k8s.container.memory.usage`, and `k8s.container.restarts` metrics appear
   - If you installed the cluster receiver, check for `k8s.job.failed_pods`

3. **Verify traces** (if your app is instrumented):
   - Go to Performance
   - Traces from your pods should appear with `k8s.pod.name` and `k8s.deployment.name` attributes

**Using MCP:**

```
Tool: search_logs
Parameters: { service: "k8s-collector", limit: 10 }
Expected: Log records with k8s.namespace.name and k8s.pod.name attributes
```

## Troubleshooting

### Logs aren't appearing

**Cause:** The Collector DaemonSet might not have permissions to read container logs, or `logsCollection` preset is disabled.

**Fix:**

1. Check Collector logs:
   ```bash
   kubectl logs -n opentelemetry-collector -l app.kubernetes.io/name=opentelemetry-collector
   ```
2. Verify the `logsCollection` preset is `enabled: true` in your `values.yaml`.
3. Ensure the Collector has RBAC permissions to read pod logs.

### Metrics show no k8s.* attributes

**Cause:** The `k8sattributes` processor isn't wired into the pipeline, or `kubernetesAttributes` preset is disabled.

**Fix:**

1. Verify `presets.kubernetesAttributes.enabled: true` in your `values.yaml`.
2. Check that `k8sattributes` appears in all three pipeline `processors` lists (traces, logs, metrics).
3. Restart the Collector:
   ```bash
   kubectl rollout restart deployment/opentelemetry-collector -n opentelemetry-collector
   ```

### Exporter returns 500 errors

**Cause:** The endpoint is set to `https://ingest.newtalaria.com` (without `/otlp`), so the Collector posts to `/v1/logs` instead of `/otlp/v1/logs`.

**Fix:** Set `endpoint: https://ingest.newtalaria.com/otlp` in the exporter config. The OTLP spec requires the Collector to append `/v1/{traces,logs,metrics}` to the base URL.

### CronJob check-ins aren't showing up in Monitors

**Cause:** The endpoint or header name is wrong, or the monitor token is invalid.

**Fix:**

1. Check the CronJob logs for HTTP errors:
   ```bash
   kubectl logs -n default job/<job-name>
   ```
2. Verify the endpoint is `https://ingest.newtalaria.com/v1/check-ins`.
3. Verify the header is `X-Talaria-Monitor-Token`.
4. Regenerate the monitor token from the dashboard if it was revoked.

## Next steps

- **Create alerts**: Set up metric alerts for `k8s.container.restarts > 0` or `k8s.job.failed_pods > 0` (Alerts page)
- **Monitor your CronJobs**: Go to Monitors and confirm check-ins are arriving
- **Instrument your apps**: Add a Talaria SDK or OpenTelemetry instrumentation to your pods for error tracking and distributed tracing

## For agents

This task includes MCP tool verification. Use `search_logs` with `service: "k8s-collector"` to confirm log ingestion from the Kubernetes collector.
