#!/bin/zsh

ansible-playbook service/service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook postgres/postgres.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook redis/redis.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook auth_service/auth_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook landing_service/landing_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook mailer_service/mailer_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook projects_service/projects_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook users_service/users_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook signal_service/signal_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook directories_service/directories_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook tenants_service/tenants_service.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook landing/landing.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook spa/spa.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"
ansible-playbook nginx/nginx.yml -i hosts.ini --vault-password-file  ~/Dev/doqa-servicee/vaultpass.txt --extra-vars "ansible_sudo_pass=$PASS"