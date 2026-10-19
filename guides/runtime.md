# Runtime

The runtime page is one row per service, environment, and deployment. A deployment is a Kubernetes deployment name, a container name, or a host name, whichever the resource attributes include.

Each row shows the release, the last check-in, restarts, disk, CPU, memory, and the log error count for the last hour. Open a row to filter issues to that resource.

## Resource attributes

The Collector stamps these on every log, metric, and check-in:

- `service.name`, `service.version`, `deployment.environment.name`
- `k8s.cluster.name`, `k8s.namespace.name`, `k8s.deployment.name`, `k8s.pod.name`, `k8s.container.name`, `k8s.node.name`
- `container.name`, `container.image.name`, `host.name`

## Logs

`POST /otlp/v1/logs` accepts OTLP JSON and protobuf, gzip, and a project API key with `logs:write`. Lines keep `trace_id` and `span_id`. An error line opens an issue when that trace does not already have an SDK exception.

`get_logs` reads lines by trace, service, severity, and time.

## Gauges

`POST /otlp/v1/metrics` accepts `container.cpu.usage`, `container.memory.usage`, `container.filesystem.usage`, and the `k8s.*` gauges the Collector emits. The key scope is `metrics:write`.

A gauge alert uses kind `gauge` and a query such as `metric:container.filesystem.usage AND tag.container.name:web`. A log-rate alert uses kind `logRate` and optional `service:web`. The threshold is the error count in the window.

`k8s.job.failed_pods` above zero opens an issue. A rising `k8s.container.restarts` opens one issue. Filesystem usage at or above 90% of the limit opens a disk issue and resolves below 85%.

Logs are metered separately from events, per organization billing period, by decompressed OTLP bytes, and log billing is on by default. Each plan includes a monthly amount (Developer 1 GB, Team 5 GB, Business 20 GB, Enterprise 100 GB), then $0.50 per GB. Developer and the no-card trial get a 402 on `/otlp/v1/logs` once the include is used. Team and Business pay overage up to their log spending cap (by default $10 on Team and $25 on Business), which you can change under **Billing > Limits**, with warning emails at 80% and 100%. Metric points are not billed.
