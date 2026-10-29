---
id: kubernetes-collector
title: Kubernetes
description: Deploy the OpenTelemetry Collector on Kubernetes to send traces, logs, and metrics to Talaria.
type: guide
section: deploy
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
  - label: A Kubernetes cluster with kubectl access
  - label: Helm 3 installed
credentials:
  - secret-key
  - monitor-token
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
- **Traces**: Relay OTLP traces from instrumented apps to Talaria. **Note**: OTLP export uses HTTP only (`otlp_http`); gRPC is not supported.
- **Resource enrichment**: Attach `k8s.namespace.name`, `k8s.deployment.name`, `k8s.pod.name` to every signal

## Before you start

1. **Get a secret key** from Project settings › API keys. It should start with `tal_sk_prod_nz1_…` (production), `tal_sk_stg_nz1_…` (staging), `tal_sk_test_nz1_…` (test), or `tal_sk_dev_nz1_…` (development).
2. **Decide your service name**: This will appear in Runtime as the top-level grouping (e.g., `checkout-api`, `background-jobs`).
3. **Have `kubectl` and Helm 3** ready.

## Steps

### 1. Set the environment variables

Store the secret key so the Collector can reference it:

```bash
kubectl create secret generic talaria-ingest \
  --from-literal=api-key=tal_sk_prod_nz1_… \
  --namespace=opentelemetry-collector
```

Replace `tal_sk_prod_nz1_…` with your actual key.

If your application pods send telemetry directly (not just via the collector), they need the secret key too. Add it to their Deployment `env:`:

```yaml
env:
  - name: TALARIA_API_KEY
    valueFrom:
      secretKeyRef:
        name: talaria-ingest
        key: api-key
```

### 2. Pass the release to the runtime

Set the release on your application pods so events are tagged with the deployed version. Use `service.version` in OpenTelemetry resource attributes or the `OTEL_RESOURCE_ATTRIBUTES` environment variable:

```yaml
env:
  - name: OTEL_RESOURCE_ATTRIBUTES
    value: "service.version=v1.2.3"
```

This tags traces, logs, and errors with the release, making it easier to correlate issues with deployments.

### 3. Collect logs

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

#### Optional: Cluster-wide metrics

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

### 4. Check in from scheduled jobs

For explicit job health tracking beyond metrics, have your CronJob send check-ins to Talaria Monitors. Create a monitor token from the dashboard (Monitors › Create monitor), then add it as a Secret:

```bash
kubectl create secret generic talaria-import-monitor \
  --from-literal=monitor-token=tal_mon_nz1_… \
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
                  curl -fsS -X POST "https://ingest-nz1.newtalaria.com/v1/check-ins" \
                    -H "Authorization: Bearer $TALARIA_MONITOR_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d '{"status":"in_progress"}'
                  
                  # Run the job
                  /app/import
                  status=$?
                  
                  # Send ok or error
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
Parameters: { service: "<your-deployment-name>", limit: 10 }
Expected: Log records with k8s.namespace.name and k8s.pod.name attributes
```

Replace `<your-deployment-name>` with your actual deployment name. The `service` value comes from `service.name`, which the resource processor sets from `k8s.deployment.name`.

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

**Cause:** The endpoint is set to `https://ingest-nz1.newtalaria.com` (without `/otlp`), so the Collector posts to `/v1/logs` instead of `/otlp/v1/logs`.

**Fix:** Set `endpoint: https://ingest-nz1.newtalaria.com/otlp` in the exporter config. The OTLP spec requires the Collector to append `/v1/{traces,logs,metrics}` to the base URL.

### CronJob check-ins aren't showing up in Monitors

**Cause:** The endpoint or header name is wrong, or the monitor token is invalid.

**Fix:**

1. Check the CronJob logs for HTTP errors:
   ```bash
   kubectl logs -n default job/<job-name>
   ```
2. Verify the endpoint is `https://ingest-nz1.newtalaria.com/v1/check-ins`.
3. Verify the header is `Authorization: Bearer`.
4. Regenerate the monitor token from the dashboard if it was revoked.

## Next steps

- [Monitors](../../features/monitors.md) — Track job health with check-ins
- [Runtime health](../../features/runtime.md) — Monitor app health and performance

## For agents

This task includes MCP tool verification. Use `search_logs` with `service: "<your-deployment-name>"` (matching your actual deployment name) to confirm log ingestion from the Kubernetes collector. The `service` value comes from `service.name`, which is set from `k8s.deployment.name` by the resource processor.
