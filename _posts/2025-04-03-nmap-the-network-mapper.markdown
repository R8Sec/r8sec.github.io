---
layout: article
title: "Nmap — The Network Mapper"
excerpt: "Learn how to use Nmap to discover live hosts on the network and potentially vulnerable running services. Nmap is one of the most fundamentals tools any security proffesional needs."
---
# Nmap — The Network Mapper
Nmap is a powerful open-source tool widely used by security professionals. As explained on [their website](https://nmap.org/), Nmap uses raw IP packets in novel ways to determine what hosts are available on the network, what services (application name and version) those hosts are offering, what operating systems (and OS versions) they are running, what type of packet filters/firewalls are in use, and dozens of other characteristics.
The information gathered by Nmap serves as a fundamental building block in penetration testing and general network auditing, as it helps pinpoint potential vulnerabilities while offering a clearer view of an environment’s security posture.
In this introductory Nmap tutorial, we’ll learn how to use Nmap for host discovery and basic port enumeration.

## Mapping the network
Host discovery is often the starting point of any network reconnaissance, as it helps identify the machines currently active and reachable. Let's figure out which hosts are live in my home network by running the command `nmap -sn 192.168.0.0/24`

![Nmap host discovery unprivileged user](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-host-discovery-no-sudo.png)

Nmap discovered 3 live hosts. The default host discovery done with `-sn` (no port scan) consists of an [ICMP](https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol) echo request, [TCP SYN](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Protocol_operation) to port 443, TCP ACK to port 80, and an ICMP timestamp request by default.
However, this requests are sometimes not enough to discover all the live hosts in a network.

Very often firewalls block ICMP requests by default, this leads to nmap missing out some live hosts. Let's see what happens when we run nmap as a privileged user using `sudo`.


![Nmap host discovery privileged user](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-host-discovery-sudo.png)


When running the host discovery scan using `sudo`, [ARP](https://en.wikipedia.org/wiki/Address_Resolution_Protocol) requests are used. Firewalls typically cannot prevent host discovery scans that use ARP requests. This is due to ARP operating at Layer 2 (Data Link Layer) whereas firewalls generally operate at Layer 3 or above.
Previously, the firewall could successfully block ICPM probes because ICMP is a layer 3 protocol. However, network firewalls usually don’t even see ARP traffic because it doesn't go through them. This led us to discover 2 extra hosts which we were unaware of before running the scan with `sudo`.

In this example, I passed the `192.168.0.0/24` subnet as the target, but we can also provide nmap with a file containing a list of IPs and/or subnets by using the `-iL` flag.

![Nmap host discovery using file containing targets](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-host-discovery-hosts-list.png)

To get a clean list of all live hosts and save them to a file, we can run the following one-liner: `sudo nmap -sn 192.168.0.0/24 | grep for | cut -d " " -f 5 | tee hosts.txt`

## Port scanning
Once we have some live hosts in our radar, we can start port scanning.
There are about a dozen [scan types](https://nmap.org/book/man-port-scanning-techniques.html) nmap can perform, here we'll focus in the following three basic types:
- TCP connect scan
- TCP SYN scan
- UDP scan

### TCP connect scan
This is the default scan type used when we run Nmap as a non-privileged user. We can also specify this using the `-sT` flag. When this scan type is used, Nmap asks the underlying operating system to establish a connection with the target machine and port by issuing the connect system call. This means your host will attempt a [3-way handshake](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_establishment) with the target for each scanned port to determine its state. This type of scan if usually more accurate and less disruptive because it behaves like a normal client connection, however, it can be more easily detected by IDS/IPS solutions.

```bash
nmap <TARGET>

# You need to specify the TCP connect scan if nmap is run as a privileged user
sudo nmap <TARGET> -sT
```

![Nmap TCP connect scan](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-TCP-connect-scan.png)

### TCP SYN scan
With the right level of privileges, Nmap performs a TCP SYN scan by default. If we want to specify this option we need to use the `-sS`, but it will only work if run as a privileged user. This is generally faster, stealthier and relatively unobtrusive, because our host does not attempt to stablish a full TCP connection for each port. Instead, the connection is dropped after receiving a SYN-ACK (open port) or a RST (closed port) response from the server, never completing a 3-way handshake. If no response is received after several retransmissions, the port is marked as filtered.

```bash
# You can skip the -sS flag as Nmap does a SYN scan by default
sudo nmap <TARGET> -sS
```

### UDP scan
Sometimes we might fail to find any open TCP ports, or the ports we found open might not be vulnerable. In this cases, we can scan for [UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol) ports. Nmap will carry out a UDP scan when provided with the `-sU` flag, to use this feature you need to run Nmap as a privileged user. Due to the nature of UDP, this scan can take considerably longer than a TCP scan.

```bash
sudo nmap <TARGET> -sU
```

![Nmap TCP connect scan](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-UDP-scan.png)

As you can see in the image, UDP scans can be very time consuming. But as you will see in later sections there are some scan options that can help speed this up.

## Specifying ports
By default, Nmap scans the top 1,000 most common ports for each protocol. However, you may sometimes need to scan the full range of 65,535 ports, focus on a specific subset, or even limit your scan to fewer than the default 1,000.
In this section we'll see some of the options we can use to tailor the port scan to our specific needs.

With the `-p` option, we can  specify which exact ports are to be scanned. We can provide a comma separated list of ports such as `-p 21,22,80,445,2049` or a range using a dash `-p 21-500`. If we need to scan all 65,535 existing ports, we can use `-p-`.

```bash
sudo nmap <TARGET> -p 21-500,2049,3306
```

Simirlarly, we can exclude ports from our scan by using `--exclude-ports`. We specify the ports to be excluded the same way we do with `-p`.

If we want to do a faster scan we can use `-F`. This will perform a fast scan of the top 100 most common ports.

![Nmap TCP connect scan](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-UDP-fast-scan.png)

Also, we can specify an *n* number of top ports to be scanned using `--top-ports`.

```bash
sudo nmap <TARGET> --top-ports 10
```

## Script scan and version detection
Nmap’s scripting engine (NSE) allows you to run a wide range of scripts to gather detailed information about the services discovered on your target systems. By combining script scanning with version detection, you can identify software versions, probe for potential vulnerabilities, and retrieve miscellaneous details such as SSL certificate information or HTTP server headers.

Nmap’s scripting engine includes hundreds of scripts, covering everything from basic network protocol checks to vulnerability assessments. It allows users to write (and share) simple scripts (using the Lua programming language ) to automate a wide variety of networking tasks.

By using `-sC`, we perform a script scan using the default set of scripts. Be aware that performing script scans on a target can be very intrusive and potentially destructive, use it with caution.


![Nmap TCP connect scan](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-script-scan.png)

When using `-sV`, Nmap will probe the discovered ports to determine what is actually running on them. Nmap will attempt to determine things such as the service protocol, the application name, the version number, hostname, device type, and the OS family. 

![Nmap TCP connect scan](/assets/images/2025-04-03-nmap-the-network-mapper/nmap-version-detection.png)

We can combine the version detection and script scan options using `-sCV`

## Saving output
When scanning targets, we will want to save the results for future reference. Nmap gives us the ability to save its output in several formats.

- Normal output: with `-oN`, we can save the output in normal format. This just means the output is directed to a file exactly as you see it in the terminal.
- XML output: with `-oX`, Nmap saves the output in XML format.
- Grepable output: with `-oG`, Nmap saves the output in a simple format that lists each host on one line. This is helpful for later parsing the output with tools such as `grep`, `awk`, `cut`, `sed`, etc.
- All formats: When using the `-oA` flag, Nmap saves output in the three previous formats

For example:

```bash
sudo nmap -sV -oA results <TARGET>
```

This will produce `results.nmap`, `results.xml`, and `results.gnmap` files containing the scan data.

## Conclusion
Nmap is an incredibly versatile tool that goes beyond simple host discovery and port scanning. By combining different scan types, specifying custom ports, leveraging the scripting engine, and saving detailed output in various formats, you can build a solid foundation for network reconnaissance and vulnerability assessment.

I hope to cover more Nmap in the future, but for now, you can continue exploring the possibilities by reading the [official Nmap documentation](https://nmap.org/book/man.html) and experimenting with different scripts, scan options, and advanced features. Remember: always use Nmap responsibly and only scan networks you have explicit permission to test. Happy scanning!
