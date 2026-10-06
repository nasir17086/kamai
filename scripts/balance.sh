for i in 1 2 3 4; do b=$(solana balance); echo "$b"; [ "$b" != "0 SOL" ] && break; sleep 10; done
