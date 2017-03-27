MXEASY=$(ps -A | grep node)

if ! [ -n "$MXEASY" ] ; then
    cd ~/getcomment
    node app.js &
fi