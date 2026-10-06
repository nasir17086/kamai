cd ~/kamai
anchor deploy --provider.cluster devnet 2>&1 | tail -6
anchor idl init --provider.cluster devnet -f target/idl/kamai.json 61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd 2>&1 | tail -3
solana program show -u devnet 61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd | head -6
solana balance -u devnet
