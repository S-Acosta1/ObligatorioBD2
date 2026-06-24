#!/bin/sh

cat > /usr/share/nginx/html/env-config.js << EOF
window.__ENV__ = {
$(env | grep '^VITE_' | while IFS='=' read -r key value; do
  echo "  \"$key\": \"$value\","
done)
};
EOF

exec "$@"
