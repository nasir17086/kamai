for i in $(seq 1 9); do b=$(solana balance -u devnet CpSr32anawEMPHUALz9mWxrW79A4Xeb86igVjusNfvvG); [ "$b" != "0 SOL" ] && break; sleep 10; done; echo "$b"
