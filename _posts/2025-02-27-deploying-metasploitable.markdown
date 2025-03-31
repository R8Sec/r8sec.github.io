---
layout: article
title: "Deploying Metasploitable"
excerpt: "In order to learn and practise pentesting, we need something to attack and fiddle with. Let's see how to deploy Metasploitable, an intentionally vulnerable machine where we can safely practise our skills."
---
# Deploying Metasploitable

## What is Metasploitable?
Playgrounds offer children a space to have fun while honing their motor and social skills. Similarly, aspiring hackers need safe labs for learning and practicing hacking techniques without legal risks. Rather than trying to hack our own or others' devices, we can use machines specifically designed to be vulnerable and safe for hacking practice. There are many vulnerable machines out there, but one of the most popular is Metasploitable.

Metasploitable was created by the Rapid7 Metasploit team. [Rapid7](https://www.rapid7.com/) is a well-known security company that also develops the [Metasploit Framework](https://www.metasploit.com/), a popular tool for penetration testing and developing security exploits. Metasploitable was specifically designed to be used as a target for testing Metasploit Framework exploits and other security tools and techniques.

## Requirements
The only things you need to follow this tutorial are a computer with at least 8GB of RAM and VirtualBox installed. I'll be using Windows 11 as the host operating system, but the steps are similar for other OSs.
Basic networking knowledge is assumed so I won't be going into the details of how IPs and DHCP servers work.

## Virtual Networks
A virtual network is a software-based network that exists within a physical network. Virtual networks are created by virtualization software, such as VirtualBox or VMware, and allow virtual machines to communicate with each other and with the host machine. These networks are isolated from the physical network, so they are safe to use for practising and testing.

Let's start by creating a [DHCP](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol) (Dynamic Host Configuration Protocol) server for the 10.10.10.0/24 network. I will call this network *hackinet* but you can give it a memorable name of your choice. This network will be used for our vulnerable machines.
Start by opening a windows terminal and follow these steps:

```
# Move to VirtualBox installation directory
cd 'C:\Program Files\Oracle\VirtualBox\'

# Create a DHCP server with an IP address of 10.10.10.1 which will assign IPs in the range 
# 10.10.10.10 - 10.10.10.20 to the virtual machines connected to the network 
.\VBoxManage.exe dhcpserver add --network=hackinet --server-ip=10.10.10.1 --lower-ip=10.10.10.10 --upper-ip=10.10.10.20 --netmask=255.255.255.0 --enable

# Check and confirm the details of the DHCP server you just created
.\VBoxManage.exe list dhcpservers
```

We now have a working virtual network which will allow us to perform our attacks within an isolated environment.

## Metasploitable 2
Let's start deploying our first vulnerable machine, Metasploitable 2.

1. Download the metasploitable-linux-2.0.0.zip file [here](https://sourceforge.net/projects/metasploitable/files/Metasploitable2/).
2. Once downloaded, extract its contents to the location where your other virtual machines reside, in my case it would be `C:\Users\raf8\VirtualBox VMs`
3. Open VirtualBox and click on New to create a new virtual machine. Use the following settings to create the virtual environment:
    - Name: Metasploitable 2
    - Type: Linux
    - Version: Other Linux (64-bit)
    - Base Memory: 512 MB
    - Processors: 1
    - Hard disk: Use an existing virtual hard disk file and select the `Metasploitable.vmdk` file from the files we extracted earlier
4. Click "Finish"

### Network settings
Next, we have to configure the network settings for the virtual machine.

1. Right-click on the newly created virtual machine and select *Settings*.
2. Click on *Network* and select *Adapter 1*.
3. Enable the adapter and select "Internal Network" from the "Attached to" dropdown menu.
4. Use *hackinet* as the name of the internal network. This is the virtual network we created earlier.
5. On the *Advanced* section select *Allow All* from the *Promiscuous Mode* setting.
6. Click "OK" to save the settings.

We are now ready to start the virtual machine. The login credentials are `msfadmin` for the user and password. We can use the ifconfig command to check its IP address. The IP address should be in the 10.10.10.10 - 10.10.10.20 range that we configured for the DHCP server. The virtual machine is now ready to be hacked.

## Metasploitable 3
We are now going to deploy the 2 versions of Metasploitable 3, one running Windows and the other running Linux. Metasploitable 3 is the latest available version for the Metasploitable series. To deploy these vulnerable machines we will use Vagrant, a tool for building and managing virtual machine environments in a single workflow.

1. Install [Vagrant](https://developer.hashicorp.com/vagrant/install?product_intent=vagrant)
2. With Vagrant installed, let's open a terminal and use the following commands to install Vagrant Reload and vbguest plugins:
```
vagrant plugin install vagrant-reload
vagrant plugin install vagrant-vbguest
```
3. The following commands will create a new local metasploitable workspace, download the required Vagrantfile and deploy both versions of Metasploitable 3 (Windows and Linux)
```
mkdir metasploitable3-workspace
cd metasploitable3-workspace
iwr "https://raw.githubusercontent.com/rapid7/metasploitable3/master/Vagrantfile" -outfile Vagrantfile
vagrant up
```
4. After the last command completed, both virtual machines will be up and running. Power off both VMs and change the network settings as we did with the Metasploitable 2 machine.
5. Disable additional network adapters, they aren't needed
6. We can now power the VMs and login using `vagrant` as the user and password. The Administrator password for the windows machine is also `vagrant`

The last thing to do before we can start hacking is to add a new network adapter to our attack machine and connect it to the *hackinet* internal network.

Now go ahead and start practicing!

**Note:** if you find trouble getting more than one network adapter to work on your attack host, [this](https://unix.stackexchange.com/questions/37122/virtualbox-two-network-interfaces-nat-and-host-only-ones-in-a-debian-guest-on) post will help you solve the issue. 
