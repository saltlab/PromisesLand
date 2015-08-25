#!/bin/sh

case $1 in
    c)    type="compatible";;
    i)    type="incompatible";;
    ?)    printf "Usage: %s: [-c] [-i]\n" $0
          exit 2;;
esac

ss_path="$HOME/dev/PromisesLand/subject_systems/${type}/node_modules"
project_list_path="$HOME/dev/PromisesLand/data/subject-systems-due-${type}-passing.csv"


cd $ss_path
while read p; do
cd $p
npm test
cd ..
done <$project_list_path