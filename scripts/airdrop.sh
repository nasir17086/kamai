A=$(solana address -k /root/.config/solana/id.json)
for url in https://api.devnet.solana.com https://rpc.ankr.com/solana_devnet https://devnet.helius-rpc.com https://solana-devnet.g.alchemy.com/v2/demo; do
  echo "== $url"; solana airdrop 1 $A -u $url 2>&1 | tail -1
done
solana balance -u devnet
