#!/bin/sh

# Create temp directory with correct permissions
TEMP_DIR=$(mktemp -d)
chmod g+rwx $TEMP_DIR

# Process nginx config using temp directory
envsubst '$ASSET_PATH' < /etc/nginx/nginx-tpl.conf > $TEMP_DIR/nginx.conf
cp $TEMP_DIR/nginx.conf /etc/nginx/nginx.conf || true

# Work with index.html in temp directory first
cp /usr/share/nginx/html/index.orig.html $TEMP_DIR/index.html

if [ -n "${TITLE}" ]; then
    sed "s/<title>Waldur | Cloud Service Management<\/title>/<title>${TITLE}<\/title>/" $TEMP_DIR/index.html > $TEMP_DIR/index.html.tmp
    mv $TEMP_DIR/index.html.tmp $TEMP_DIR/index.html
fi

if [ -n "${API_URL}" ]; then
    sed -E '/<link.*rel="shortcut icon".*href="[^"]*\/?favicon\.ico[^"]*".*>/s#href="[^"]*\/?favicon\.ico[^"]*"#href="'${API_URL}'api/icons/favicon"#' $TEMP_DIR/index.html > $TEMP_DIR/index.html.tmp
    mv $TEMP_DIR/index.html.tmp $TEMP_DIR/index.html

    sed "s|__API_URL__|${API_URL}|" $TEMP_DIR/index.html > $TEMP_DIR/index.html.tmp
    mv $TEMP_DIR/index.html.tmp $TEMP_DIR/index.html
fi

# Copy processed file back
cp $TEMP_DIR/index.html /usr/share/nginx/html/index.html || true

# Handle asset path
if [ -n "${ASSET_PATH}" ]; then
    mkdir -p /usr/share/nginx/html/${ASSET_PATH} || true
    # Ignore recursion error
    cp -r /usr/share/nginx/html/* /usr/share/nginx/html/${ASSET_PATH}/ 2>/dev/null || true
fi

# Cleanup
rm -rf $TEMP_DIR

# Start nginx
nginx -g 'daemon off;'