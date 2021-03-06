# -*- mode: ruby -*-
# # vi: set ft=ruby :

# Vagrant version and Vagrant API version requirements
Vagrant.require_version ">= 1.6.0"
VAGRANTFILE_API_VERSION = "2"

# YAML module for reading box configurations.
require 'yaml'

# Read machine configs from YAML file
machines = YAML.load_file(File.join(File.dirname(__FILE__), 'machines.yml'))

# Create boxes
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # Disable updates to keep environment sane.
  # config.vm.box_check_update = false

  # # Disable shared folder, see https://superuser.com/questions/756758/is-it-possible-to-disable-default-vagrant-synced-folder
  # config.vm.synced_folder '.', '/vagrant', disabled: true
  # Check for missing plugins
  required_plugins = %w(vagrant-disksize vagrant-hostmanager vagrant-vbguest vagrant-clean)
  plugin_installed = false
  required_plugins.each do |plugin|
    unless Vagrant.has_plugin?(plugin)
          system "vagrant plugin install #{plugin}"
      plugin_installed = true
    end
  end

  # If new plugins installed, restart Vagrant process
  if plugin_installed === true
    exec "vagrant #{ARGV.join' '}"
  end

  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.hostmanager.manage_guest = true
  config.hostmanager.include_offline= true
  config.hostmanager.ignore_private_ip = false

  config.vm.box_check_update = false
  config.vbguest.auto_update = false

  # Iterate through entries in YAML file
  machines.each do |machine|
    config.vm.define machine["name"] do |box|
      box.vm.box = machine["box"]
      box.vm.box_version = machine["box_version"]
      box.vm.hostname = machine["name"]
      box.vm.network "private_network", ip: machine["ip"]

      if machine["script"] != nil
        box.vm.provision :shell, :path => machine["script"]
      end

      if machine["ansible"] != nil
        box.vm.provision "ansible_local" do |ansible|
            ansible.playbook = machine["ansible"]
            ansible.verbose = "False"
        end
      end

      box.vm.provider :virtualbox do |vb|
        vb.name = machine["name"]
        vb.memory = machine["ram"]

        if machine["gui"] != nil
        	vb.gui = false
        end # end of gui

        vb.customize ["modifyvm", :id, "--groups", "/DevSecOps-Studio"]

      end # end of vb provider
    end # end of box
  end # end of machines loop

  config.vm.provision "shell", inline: <<-SHELL
    DEBIAN_FRONTEND=noninteractive apt-get install -y avahi-daemon libnss-mdns
  SHELL

end # end of config
