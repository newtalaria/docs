## Resource Attributes (OpenTelemetry Semantic Conventions v1.44.0)

Set via `OTEL_RESOURCE_ATTRIBUTES` or your SDK's resource configuration.

### Required

| Attribute | Description | Example |
|---|---|---|
| `service.name` | Service identifier | `checkout-api` |
| `service.version` | Release string (Talaria format: `<ref>@<shortsha>`) | `main@a8f31c2` |
| `deployment.environment.name` | Environment name | `production`, `staging`, `test`, `development` |

### Recommended

| Attribute | Description | Example |
|---|---|---|
| `service.namespace` | Logical grouping for multi-service apps | `ecommerce` |
| `service.instance.id` | Unique instance identifier | Pod name, container ID |
| `vcs.ref.head.revision` | Full commit SHA | `a8f31c2f0b...` |
| `vcs.ref.head.name` | Branch or tag name | `main`, `v1.2.3` |
| `vcs.repository.url.full` | Repository URL | `https://github.com/org/repo` |

### Conditional (when applicable)

**Kubernetes:**
- `k8s.cluster.name`, `k8s.namespace.name`, `k8s.deployment.name`, `k8s.pod.name`, `k8s.container.name`, `k8s.node.name`, `k8s.cronjob.name`, `k8s.job.name`

**Containers:**
- `container.id`, `container.image.name`, `container.image.tags`, `container.name`

**Hosts:**
- `host.name`, `host.id`

**CI/CD:**
- `cicd.pipeline.name`, `cicd.pipeline.run.id`, `cicd.pipeline.run.url.full`, `cicd.pipeline.task.name`, `cicd.pipeline.result`

### Example

```bash
export OTEL_SERVICE_NAME="checkout-api"
export TALARIA_RELEASE="main@a8f31c2"
export TALARIA_COMMIT_SHA="${GITHUB_SHA}"
export OTEL_RESOURCE_ATTRIBUTES="service.version=${TALARIA_RELEASE},deployment.environment.name=production,service.namespace=ecommerce,vcs.ref.head.revision=${TALARIA_COMMIT_SHA},vcs.ref.head.name=${GITHUB_REF_NAME},vcs.repository.url.full=https://github.com/myorg/myrepo"
```
