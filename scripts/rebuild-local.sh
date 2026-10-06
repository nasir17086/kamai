cp /mnt/c/Users/user/Kamai/program-src/lib.rs ~/kamai/programs/kamai/src/lib.rs
cd ~/kamai && anchor build 2>&1 | grep -E "^(error|warning: unused)|-->|Finished" | head -20
cp target/idl/kamai.json target/types/kamai.ts /mnt/c/Users/user/Kamai/web/src/idl/
source /mnt/c/Users/user/Kamai/scripts/localnet.sh
