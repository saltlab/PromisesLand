#!/bin/sh


case $1 in
    c)    type="compatible";;
    i)    type="incompatible";;
    ?)    printf "Usage: %s: [-c] [-i]\n" $0
          exit 2;;
esac

#dir_path="$HOME/dev/RoundTrace/stats/top_${type}.txt"
sources_path="$HOME/dev/PromisesLand/subject_systems/${type}"

if [ -d $sources_path ]; then
    echo "$sources_path exists."
    cd "${sources_path}/node_modules"
    for d in */ ; do
#    node /Users/keheliya/Desktop/CallMeBack_Backup/Archive_code/stats/stats_chain.js -d "$d"
#    echo "$d"
    #node /Users/keheliya/dev/RoundTrace/stats/stats_dir.js "$d"
    cd "$d"
    # npm install
    npm test
    cd ..
    done
else
    echo "$sources_path does not exist"
fi