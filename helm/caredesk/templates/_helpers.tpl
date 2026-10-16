{{- define "caredesk.name" -}}
caredesk
{{- end -}}

{{- define "caredesk.labels" -}}
app.kubernetes.io/name: {{ include "caredesk.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
