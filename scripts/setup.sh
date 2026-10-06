set -e
cp /mnt/c/Users/user/Kamai/program-src/lib.rs programs/kamai/src/lib.rs
cd programs/kamai
grep -q anchor-spl Cargo.toml || sed -i 's/^anchor-lang = "1.1.2"/anchor-lang = { version = "1.1.2", features = ["init-if-needed"] }\nanchor-spl = "1.1.2"/' Cargo.toml
sed -i 's/^idl-build = \["anchor-lang\/idl-build"\]/idl-build = ["anchor-lang\/idl-build", "anchor-spl\/idl-build"]/' Cargo.toml
cd ../..
[ -f ~/.config/solana/id.json ] || solana-keygen new --no-bip39-passphrase -s -o ~/.config/solana/id.json
solana config set --url devnet >/dev/null
mkdir -p target/deploy
[ -f target/deploy/kamai-keypair.json ] || solana-keygen new --no-bip39-passphrase -s -o target/deploy/kamai-keypair.json
PID=$(solana address -k target/deploy/kamai-keypair.json)
echo PID=$PID
sed -i "s/declare_id!(\"[^\"]*\")/declare_id!(\"$PID\")/" programs/kamai/src/lib.rs
cat > Anchor.toml <<EOF
[toolchain]
anchor_version = "1.1.2"

[features]
resolution = true
skip-lint = false

[programs.devnet]
kamai = "$PID"

[programs.localnet]
kamai = "$PID"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
EOF
cat programs/kamai/Cargo.toml | sed -n '/dependencies/,/dev-dep/p'
echo WALLET=$(solana address)