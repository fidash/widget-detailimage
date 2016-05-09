#Detail Image Widget

[![GitHub license](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://raw.githubusercontent.com/fidash/widget-detailimage/master/LICENSE)
[![Support badge](https://img.shields.io/badge/support-askbot-yellowgreen.svg)](http://ask.fiware.org)
[![Build Status](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20Detail%20Image/badge/icon)](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20Detail%20Image/)

This project is part of [FIWARE](https://www.fiware.org/). This widget is part of FI-Dash component included in FIWARE.

The widget displays all the attributes of an OpenStack Image available to the user in FIWARE's Cloud. The widget also allows the user to edit and delete the displayed image.


## Wiring endpoints

The Detail Image widget has the following input wiring endpoints:

|Label|Name|Friendcode|Type|Description|
|:--:|:--:|:--:|:--:|:--|
|Authentication|authentication|openstack-auth|text|Receive the authentication data via wiring.|
|Image ID|image_id|image_id|text|Receives image ID and OpenStack service token.|
