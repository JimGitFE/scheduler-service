# Schedule Servicie

Deferred HTTP Request (Invocation). Job/Task Scheduling

Use cas: Stateless servers

AWS VPS: `ssh -i ~/.ssh/<pem_key>.pem ubuntu@<ip>`

## Build VPS Docker

1. `git pull origin main`
2. `sudo docker build -t scheduler-service .`
3. `docker rm -f scheduler-instance`
4. `docker run -d --name scheduler-instance --restart always -p 3010:3010 -v $(pwd)/data:/app/data scheduler-service`
5. `docker logs scheduler-instance`

Low memory, temporary re-allocate in hard-disk

```bash
# Create a 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent so it stays after a reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```