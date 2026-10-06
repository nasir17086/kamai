#!/bin/bash
# Usage (from Windows): wsl -d Ubuntu-24.04 -u root -- bash /mnt/c/Users/user/Kamai/scripts/wsl-env.sh '<command>'
source "$HOME/.cargo/env"
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
cd "$HOME/kamai" 2>/dev/null || cd "$HOME"
eval "$1"
