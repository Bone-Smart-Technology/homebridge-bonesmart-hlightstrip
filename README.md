
# H-LightStrip Plugin for Homebridge

Exemplo de configuração de um dispositivo H-LightStrip no config.json do Homebridge:

 ```
 "accessories": [
   {
       "accessory": "H-LightStrip",
       "name": "Informe um nome para o seu dispositivo",
       "ip": "Informe o endereço de rede do seu dispositivo",
       "setup": "Informe a opção de configuração da fita LED (RGB, RGBW ou RGBWW)",
       "serialnumber": "Insira aqui o número de série do seu dispositivo",
       "purewhite": "O valor é true se a fita LED possui led branco dedicado"
   }
 ]
```

> Obs.: O número de série é opcional, o setup tem por padrão RGBW e o purewhite padrão é false

[![](https://scontent.fpoa10-1.fna.fbcdn.net/v/t1.0-9/29683359_2008233752836223_8865180325666098214_n.png?_nc_cat=0&oh=8731c63f4c6725c6f421da3e4138b791&oe=5B91F9C9)](http://bonesmart.tech)