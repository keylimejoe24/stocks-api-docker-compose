
import sys
import ruamel.yaml
from jinja2 import Template

parameter2_data_tmpl = Template("""\
global:
  scrape_interval: 5s
scrape_configs:
  - job_name: "{{ scraping_host_1 }}"
    static_configs:
      - targets: ["{{ scraping_host_1_ip }}:3000"]
  - job_name: "{{ scraping_host_2 }}"
    static_configs:
      - targets: ["{{ scraping_host_2_ip }}:3000"]
  - job_name: "{{ scraping_host_3 }}"
    static_configs:
      - targets: ["{{ scraping_host_3_ip }}:3000"]
  - job_name: "{{ scraping_host_4 }}"
    static_configs:
      - targets: ["{{ scraping_host_4_ip }}:3000"]
  - job_name: "{{ scraping_host_5 }}"
    static_configs:
      - targets: ["{{ scraping_host_5_ip }}:3000"]
  - job_name: "{{ scraping_host_6 }}"
    static_configs:
      - targets: ["{{ scraping_host_6_ip }}:3000"]
  - job_name: "{{ scraping_host_7 }}"
    static_configs:
      - targets: ["{{ scraping_host_7_ip }}:3000"]
  - job_name: "{{ scraping_host_8 }}"
    static_configs:
      - targets: ["{{ scraping_host_8_ip }}:3000"]
""")

render_params = {
    "scraping_host_1" :"host",
    "scraping_host_1_ip" :"host_ip",
    "scraping_host_2" :"host",
    "scraping_host_2_ip" :"host_ip",
    "scraping_host_3" :"host",
    "scraping_host_3_ip" :"host_ip",
    "scraping_host_4" :"host",
    "scraping_host_4_ip" :"host_ip",
    "scraping_host_5" :"host",
    "scraping_host_5_ip" :"host_ip",
    "scraping_host_6" :"host",
    "scraping_host_6_ip" :"host_ip",
    "scraping_host_7" :"host",
    "scraping_host_7_ip" :"host_ip",
    "scraping_host_8" :"host",
    "scraping_host_8_ip" :"host_ip"
}

parameter2_data = parameter2_data_tmpl.render(render_params)

    
yaml = ruamel.yaml.YAML()
yaml.indent(sequence=4, offset=2)
new_data = yaml.load(parameter2_data)


with open(r'scripts/prometheus.yml', 'w') as file:
    yaml.dump(new_data, file)