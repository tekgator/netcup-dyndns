# netcup-dyndns

<p>
  <a href="https://github.com/tekgator/netcup-dyndns/blob/main/LICENSE" alt="License">
    <img src="https://img.shields.io/github/license/tekgator/netcup-dyndns" />
  </a>
  <img src="https://img.shields.io/github/languages/top/tekgator/netcup-dyndns" />
  <a href="https://hub.docker.com/r/tekgator/netcup-dyndns" alt="DockerPulls">
    <img src="https://img.shields.io/docker/pulls/tekgator/netcup-dyndns" />
  </a>
  <a href="https://hub.docker.com/r/tekgator/netcup-dyndns/tags?page=1&ordering=last_updated" alt="DockerBuildStatus">
    <img src="https://img.shields.io/docker/image-size/tekgator/netcup-dyndns/latest" />
  </a>
  <a href="https://github.com/tekgator/netcup-dyndns/actions/workflows/build-and-publish.yml" alt="BuildStatus">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/tekgator/netcup-dyndns/build-and-publish.yml">
  </a>
  <a href="https://github.com/tekgator/netcup-dyndns/releases" alt="Releases">
    <img src="https://img.shields.io/github/v/release/tekgator/netcup-dyndns" />
  </a>
  <a href="https://github.com/tekgator/netcup-dyndns/releases" alt="Releases">
    <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/tekgator/netcup-dyndns">
  </a>
  <a href="https://github.com/tekgator/netcup-dyndns/commit" alt="Commit">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/tekgator/netcup-dyndns">
  </a>
</p>

Netcup DynDNS is a lightweight tool written in TypeScript that updates your domains with your current public IP address.
This project is not affiliated with Netcup GmbH or any other service provider.

- Maintained by [Patrick Weiss](https://github.com/tekgator)
- Problems and issues can be filed on the [Github repository](https://github.com/tekgator/netcup-dyndns/issues)

## buy-me-a-coffee

If I've helped you and you like some of my work, feel free to buy me a coffee ☕ (or more likely a beer 🍺)

<a href='https://ko-fi.com/C0C7LO3V1' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Description

Since [ddclient](https://ddclient.net) does not support Netcup, I decided to develop a small tool to update DNS records with the current public IP address. While there are existing solutions, none fully meet my requirements. For instance, some rely on running a PHP script via a cron job, lack support for managing multiple domains, or cannot handle updates for specific subdomains within a domain.

The goal of this tool is to provide an easy-to-use solution packaged as a Docker image. It should be simple to configure and adaptable to various needs, making it a convenient and efficient choice for managing DNS updates.

## Details

- Configurable refresh interval
- Multi domain support
- Multi subdomain / host support
- IPv4 and IPv6 support
- Multiple public IP providers to choose from
  - [ipify](https://www.ipify.org/)
  - [icanhazip](https://icanhazip.com/)
  - [ident.me](https://www.ident.me/)
  - [MyIP](https://www.my-ip.io/)
  - [SeeIP](https://seeip.org/)
  - [AVM FRITZ!Box](https://www.avm.de/)
  - Random IP generator (mostly for testing and debugging purpose)
- If multiple IP providers are configured a fallback will be used if one fails
- more to come...

### Notes on the AVM FRITZ!Box IP Provider

Using the FRITZ!Box API to request the current local IP address is the fastest way to retrieve the public IP address. No API key or password is required, and no external requests are made, ensuring speed and keeping everything local.
The drawback of the SOAP request is that it returns either an IPv4 **or** an IPv6 address, but not both.
Based on my testing, the results are as follows:

From my testing I get the following results:

| Internet Provider Setup | SOAP returns IPv4 | SOAP returns IPv6 |
| ----------------------- | ----------------- | ----------------- |
| Ipv4 and Ipv6           | Yes               | No                |
| Ipv4 only               | Yes               | No                |
| Ipv6 only               | No                | Yes               |

#### Conclusion

- If your provider offers an IPv4 address and you only need IPv4, the FRITZ!Box IP provider is the best choice.
- If your provider **only** offers an IPv6 address and you only need IPv6, the FRITZ!Box IP provider is the best choice.
- If you require both IPv4 and IPv6, the FRITZ!Box IP provider is not the ideal solution.

## Requirements

- a host within your network to run the tool
- either Docker installed or NodeJS if executed without Docker
- a [Netcup](https://www.netcup.net/) account
- a API key and password which can be obtained via the [Netcup control panel](<(https://customercontrolpanel.de/)>)

## Run

#### Configuration / Environment Variables

| Name                                            | Description                                                                                                                                                                       | Optional | Default                                            | Example                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CUSTOMER_ID                                     | Customer ID can be found in the Netcup CC Panel                                                                                                                                   | No       |                                                    | 123456                                                                                                                                                                                                                                                                                                                                                                                                                            |
| API_KEY                                         | API access information can be created and found in the Netcup CC Panel                                                                                                            | No       |                                                    | samplekey                                                                                                                                                                                                                                                                                                                                                                                                                         |
| API_PASSWORD                                    | API access information can be created and found in the Netcup CC Panel                                                                                                            | No       |                                                    | samplepassword                                                                                                                                                                                                                                                                                                                                                                                                                    |
| REFRESH_INTERVAL                                | Refresh inteval for dynamic DNS updates                                                                                                                                           | Yes      | 5m                                                 | 5m = 5 minutes<br/>60s = 60 seconds<br/>1h = 1 hour<br/>60 = 60 seconds                                                                                                                                                                                                                                                                                                                                                           |
| IP_VERSION                                      | IP version for dynamic DNS updates                                                                                                                                                | Yes      | 4                                                  | 0 = Both<br/>4 = IPv4<br/>6 = IPv6                                                                                                                                                                                                                                                                                                                                                                                                |
| USE_CACHE                                       | Cache public IP address<br/>true = use IP cache; only query Netcup DNS records if IP address change is detected locally<br/>false = do not use IP cache; always query DNS records | Yes      | true                                               | true or 1<br/>false or 0                                                                                                                                                                                                                                                                                                                                                                                                          |
| IP_PROVIDER<span style="color:red">**X**</span> | IP provider to use for dynamic DNS updates                                                                                                                                        | Yes      | icanhazip<br/>identme<br/>ipify<br/>myip<br/>seeip | IP_PROVIDER<span style="color:red">**1**</span>=icanhazip<br/>IP_PROVIDER<span style="color:red">**2**</span>=ipify<br/>IP_PROVIDER<span style="color:red">**3**</span>=identme<br/>IP_PROVIDER<span style="color:red">**4**</span>=myip<br/>IP_PROVIDER<span style="color:red">**5**</span>=seeip<br/>IP_PROVIDER<span style="color:red">**6**</span>=fritzbox<br/>IP_PROVIDER<span style="color:red">**7**</span>=randomip<br/> |
| DOMAIN<span style="color:red">**X**</span>      | Provide only the zone name, e.g. sample.com or including its subdomains, comma seperated after the zone name (required, at least one domain is required)                          | No       |                                                    | DOMAIN<span style="color:red">**1**</span>=sample1.com<br/>DOMAIN<span style="color:red">**2**</span>=sample2.com,sub1,sub2<br/>DOMAIN<span style="color:red">**3**</span>=sample3.com,\*,@,sub1                                                                                                                                                                                                                                  |

#### Use with docker-compose:

A [sample](docker/docker-compose.yml) docker-compose file can be found within the repository.

```yml
netcup-dyndns:
  image: tekgator/netcup-dyndns:latest
  container_name: netcup-dyndns
  restart: unless-stopped
  environment:
    # Customer ID can be found in the Netcup CC Panel (required)
    CUSTOMER_ID: 123456

    # API access information can be created and found in the Netcup CC Panel (required)
    API_KEY: samplekey
    API_PASSWORD: samplepassword

    # Domain configuration: Provide only the zone name, e.g. sample.com
    # or including its subdomains, comma seperated after the zone name
    # (required, at least one domain is required)
    DOMAIN1: sample1.com
    DOMAIN2: sample2.com,sub1,sub2
    DOMAIN3: sample3.com,*,@,sub1
```

#### Use with docker run:

```bash
docker run -d \
  --name netcup-dyndns \
  --restart unless-stopped \
  # Customer ID can be found in the Netcup CC Panel (required)
  -e CUSTOMER_ID=123456 \

  # API access information can be created and found in the Netcup CC Panel (required)
  -e API_KEY=samplekey \
  -e API_PASSWORD=samplepassword \

  # Domain configuration: Provide only the zone name, e.g. sample.com
  # or including its subdomains, comma seperated after the zone name
  # (required, at least one domain is required)
  -e DOMAIN1=sample1.com \
  -e DOMAIN2=sample2.com,sub1,sub2 \
  -e DOMAIN3=sample3.com,*,@,sub1 \

  tekgator/netcup-dyndns:latest
```
