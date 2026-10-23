# Proposed network plan

All addresses and links here are proposed. No live network scan or configuration change was performed.

- Core: 192.168.63.0/24.
- SKID-01: 192.168.10.0/24, PLC / Network Core.
- SKID-02: 192.168.20.0/24, VFD and Motion.
- SKID-03: 192.168.30.0/24, GuardLogix / HMI Safety.
- SKID-04: 192.168.40.0/24, Servo Motion Safety Cell.
- SKID-05: 192.168.50.0/24, Guarding / E-stop.
- SKID-06: 192.168.60.0/24, Compact Machine Control and Drives.

The original 192.169.63.X request conflicts with this plan. The builder's 10.10.x.x placeholders and BMP's device addresses remain historical proposals. Use the seven CIDRs above for current planning only.

Reserve .1 for a gateway if routing is approved. Do not allocate specific hosts yet. Before host allocation, confirm actual devices/interfaces, dual-port shared-IP behavior, management interfaces, switch capability and port counts, existing plant/VPN subnet conflicts, gateway ownership, VLAN IDs, routing/firewall rules, NAT needs, DHCP/static policy and spare capacity. Network/broadcast addresses are unavailable for hosts. Record each future device IP against its canonical asset/interface and exact evidence; reject duplicates within a routing domain.

A VLAN ID is not implied by a subnet's third octet. Multiple subnets require approved routing/firewall design for cross-subnet communication; a switch uplink alone does not supply it. No Layer 3 capability is established by the generic switch icon. EtherNet/IP, CIP Motion timing/multicast/PTP requirements and CIP Safety endpoints require device/application validation. A dedicated safety VLAN is neither proved nor prescribed by these photos.

See diagrams/proposed-topology.mmd. Dashed lines mean proposed logical connectivity, not verified cable paths. Keep a future as-built diagram separate until source port/configuration evidence supports it.
