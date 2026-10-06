cd ~/kamai
pkill -f solana-test-validator 2>/dev/null; sleep 1
nohup solana-test-validator --reset --quiet --ledger /root/kamai-ledger > /root/validator.log 2>&1 &
for i in $(seq 1 30); do solana -u localhost cluster-version >/dev/null 2>&1 && break; sleep 2; done
solana -u localhost cluster-version
solana -u localhost airdrop 50 >/dev/null && solana -u localhost balance
anchor deploy --provider.cluster localnet 2>&1 | tail -5
solana -u localhost program show 61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd | head -5
