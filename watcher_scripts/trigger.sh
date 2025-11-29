if [ -z "$1" ]; then
  echo "Usage: $0 <chain_value>"
  exit 1
fi

(cd /home/pebblerye/ergo/watchers/watcher8 && deploy.sh $1) &
(cd /home/pebblerye/ergo/watchers/watcher7 && deploy.sh $1) &
wait
