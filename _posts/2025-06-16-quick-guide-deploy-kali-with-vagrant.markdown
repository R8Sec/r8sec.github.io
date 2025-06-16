---
layout: article
title: "Quick Guide — Deploy Kali with Vagrant"
excerpt: "Create a Kali VM in an instant with the help of Vagrant."
---
# Quick Guide - Deploy Kali with Vagrant
In this guide we are going to spin up a kali virtual machine in a matter of minutes using the power of Vagrant.

## Install Vagrant and VirtualBox
If you haven't already, Vagrant and VirtualBox can easily be installed from the terminal using WinGet.

```console?prompt=PS>&lang=powershell
PS> winget install Oracle.VirtualBox Hashicorp.Vagrant
```

I find using WinGet more convenient than filling my Downloads folder with installers that I often forget to delete.

> Very often, a reboot is required after installing VirtualBox. I recommend you do this now to avoid errors later.

## Deploy Kali
In the location of your choice, create a directory to hold the required files. Then navigate to that directory.

```console?prompt=PS>&lang=powershell
PS> mkdir kali
PS> cd kali
```

After running the next two commands, we'll have a fresh Kali VM up and running. If you go to make some coffee, the machine will be ready by the time you are back. By default the login is `vagrant:vagrant`

```console?prompt=PS>&lang=powershell
PS> vagrant init kalilinux/rolling --box-version 2025.1.0
PS> vagrant up
```

> There is a default shared folder in the VM located at `/vagrant`.<br>
> This is the folder where you ran the `vagrant init` command and it is a useful way to share files between your host and the VM.

## Essential Vagrant commands
```console?prompt=PS>&lang=powershell&comments=true
# Connect to the machine from your VirtualBox host using SSH
PS> vagrant ssh

# Run a command in the VM through SSH
PS> vagrant ssh -c "curl https://wttr.in/california"

# Suspend machine saving its current state
PS> vagrant suspend

# Bring the suspended machine up again and continue where you left off
PS> vagrant resume

# Power off VM
PS> vagrant halt

# Reboot
# If you make changes to the Vagrant file, run this command for them to take effect
# By default, provisioners will not run again, use the `--provision` flag to run the provisioners again
PS> vagrant reload

# No longer need the VM? Destroy it!
PS> vagrant destroy
```

## Vagrantfile
There is so much you can configure within the `Vagrantfile`. Here is an example with some basic, but useful configurations.

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure("2") do |config|
  config.vm.box = "kalilinux/rolling"
  config.vm.box_version = "2025.1.0"
  config.vm.network "private_network", ip: "192.168.123.10"
  config.vm.provider "virtualbox" do |v|
    v.gui = false
    v.memory = 4096
    v.cpus = 4
  end
end
```

- `config.vm.network "private_network", ip: "192.168.123.10"`: configures a private network so that we can access the VM at the specified IP.
- `config.vm.provider "virtualbox" do |v|`: is used to configure provider-specific settings, in our case, for VirtualBox.
- `v.gui = false`: tells VirtualBox to not open the VM's GUI when booting up.
- `v.memory = 4096`: specifies the RAM for the machine (4GB).
- `v.cpus`: number of CPUs.
