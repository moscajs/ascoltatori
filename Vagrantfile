
Vagrant.configure(2) do |config|
  config.vm.box = "boneskull/ascoltatori"
  config.vm.provision "shell", inline: $shell
end
$shell = <<-CONTENTS
export DEBIAN_FRONTEND=noninteractive
MARKER_FILE="/usr/local/etc/vagrant_provision_marker"

# Update apt
apt-get update

# Upgrade everything
yes '' | apt-get -y -o DPkg::options::="--force-confdef" -o DPkg::options::="--force-confold" dist-upgrade
# Touch the marker file so we don't do this again
touch ${MARKER_FILE}
CONTENTS
