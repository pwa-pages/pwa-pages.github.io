if [ -z "$1" ]; then
  echo "Usage: $0 <chain_value>"
  exit 1
fi

(cd /home/youruser/ergo/watchers/watcher5 && deploy.sh $1) &
(cd /home/youruser/ergo/watchers/watcher8 && deploy.sh $1) &
(cd /home/youruser/ergo/watchers/watcher7 && deploy.sh $1) &
wait
