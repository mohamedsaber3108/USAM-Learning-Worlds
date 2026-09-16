/**
 * OpenTelemetry tracing bootstrap (audit #12).
 *
 * WHY OTEL (and NOT Sentry): OpenTelemetry is Apache-2.0 / OSI open source and
 * vendor-neutral. Sentry's self-hosted offering is Functional Source License
 * (fair-source, NOT OSI-approved), so it's deliberately avoided here. OTel
 * exports to any OTLP-compatible backend (Jaeger, Tempo, Honeycomb, etc.).
 *
 * HOW IT LOADS: preloaded BEFORE the app via `node -r ./dist/observability/tracing`
 * (or ts-node -r in dev) so auto-instrumentation can patch http/express/pg/etc.
 * before they're required. See package.json start:prod.
 *
 * OPT-IN + FAIL-SOFT: tracing only initializes when OTEL_ENABLED=true. Any
 * error during setup is swallowed with a warning — observability must never
 * take down the product for a child.
 */
/* eslint-disable no-console */

function startTracing(): void {
  if (process.env.OTEL_ENABLED !== 'true') {
    return;
  }

  try {
    // Lazy require so the (heavy) OTel deps aren't loaded unless enabled.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Resource } = require('@opentelemetry/resources');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

    const exporterUrl =
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]:
          process.env.OTEL_SERVICE_NAME || 'usam-backend',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
          process.env.NODE_ENV || 'development',
      }),
      traceExporter: new OTLPTraceExporter({ url: exporterUrl }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Filesystem instrumentation is very noisy and low value here.
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });

    sdk.start();
    console.log(`[otel] Tracing initialized -> ${exporterUrl}`);

    const shutdown = () => {
      sdk
        .shutdown()
        .catch((err: unknown) => console.warn('[otel] shutdown error', err))
        .finally(() => process.exit(0));
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.warn('[otel] Failed to initialize tracing (continuing without it):', err);
  }
}

startTracing();
