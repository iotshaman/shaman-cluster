#!/bin/sh
(echo authenticate '"your-tor-manager-password-goes-here"'; echo signal newnym; echo quit) | nc localhost 9051