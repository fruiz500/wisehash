// WiseHash.js, by F. Ruiz 2014
/*
		@source: https://passlok.com

        @licstart  The following is the entire license notice for the
        JavaScript code in this page.

        Copyright (C) 2014  Francisco Ruiz

        The JavaScript code in this page is free software: you can
        redistribute it and/or modify it under the terms of the GNU
        General Public License (GNU GPL) as published by the Free Software
        Foundation, either version 3 of the License, or (at your option)
        any later version.  The code is distributed WITHOUT ANY WARRANTY;
        without even the implied warranty of MERCHANTABILITY or FITNESS
        FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

        As additional permission under GNU GPL version 3 section 7, you
        may distribute non-source (e.g., minimized or compacted) forms of
        that code without the copy of the GNU GPL normally required by
        section 4, provided you include this license notice and a URL
        through which recipients can access the Corresponding Source.


        @licend  The above is the entire license notice
        for the JavaScript code in this page.
        */
		
		
var searchExp = new RegExp(wordlist.join("|"),"g");						//make Regex for searching
var searchBlackExp = new RegExp(blacklist.join("|"),"g");

//takes a string and calculates its entropy in bits, taking into account the kinds of characters used and parts that may be in the general wordlist (reduced credit) or the blacklist (no credit)
WiseHashEntropy = function(pwd){
	
//find the raw Keyspace	
	var numberRegex = new RegExp("^(?=.*[0-9]).*$", "g");
	var smallRegex = new RegExp("^(?=.*[a-z]).*$", "g");
	var capRegex = new RegExp("^(?=.*[A-Z]).*$", "g");
	var base64Regex = new RegExp("^(?=.*[/+]).*$", "g");
	var otherRegex = new RegExp("^(?=.*[^a-zA-Z0-9/+]).*$", "g");

	pwd = pwd.replace(/\s/g,'');										//no credit for spaces
		
	var Ncount = 0;
	if(numberRegex.test(pwd)){
		Ncount = Ncount + 10;
	}
	if(smallRegex.test(pwd)){
		Ncount = Ncount + 26;
	}
	if(capRegex.test(pwd)){
		Ncount = Ncount + 26;
	}
	if(base64Regex.test(pwd)){
		Ncount = Ncount + 2;
	}
	if(otherRegex.test(pwd)){
		Ncount = Ncount + 31;											//assume only printable characters
	}
		
//start by finding words that might be on the blacklist (no credit)
	var pwd = reduceVariants(pwd);					
	var wordsFound = pwd.match(searchBlackExp);							//array containing words found on the blacklist
	if(wordsFound){
		for(var i = 0; i < wordsFound.length;i++){
			pwd = pwd.replace(wordsFound[i],'');						//remove them from the string
		}
	}
	
//now look for regular words on the wordlist				
	wordsFound = pwd.match(searchExp);									//array containing words found on the regular wordlist
	if(wordsFound){
		wordsFound = wordsFound.filter(function(elem, pos, self) {return self.indexOf(elem) == pos;})		//remove duplicates from the list
		var foundLength = wordsFound.length;							//to give credit for words found we need to count how many
		for(var i = 0; i < wordsFound.length;i++){
			pwd = pwd.replace(new RegExp(wordsFound[i], "g"),'');									//remove all instances
		}
	}else{
		var foundLength = 0;
	}
	
	pwd = pwd.replace(/(.+?)\1+/g,'$1');								//no credit for repeated consecutive character groups
		
//calculate the entropy
	
	if(pwd != ''){
		return (pwd.length*Math.log(Ncount) + foundLength*Math.log(wordlist.length + blacklist.length))/Math.LN2
	}else{
		return (foundLength*Math.log(wordlist.length + blacklist.length))/Math.LN2
	}
}

//take into account common substitutions, ignore spaces and case
function reduceVariants(string){
	return string.toLowerCase().replace(/[óòöôõo]/g,'0').replace(/[!íìïîi]/g,'1').replace(/[z]/g,'2').replace(/[éèëêe]/g,'3').replace(/[@áàäâãa]/g,'4').replace(/[$s]/g,'5').replace(/[t]/g,'7').replace(/[b]/g,'8').replace(/[g]/g,'9').replace(/[úùüû]/g,'u');
}

//first computes the entropy, then adjusts the number of iterations of scrypt accordingly before calling scrypt
WiseHashScrypt = function(pwd,salt,CPUfactor,r,p,dkLen) {
		
	var entropy = WiseHashEntropy(pwd);

//these threshold values can be edited to fit a particular system, the idea is to use more iterations for smaller entropy
	if(entropy < 10){
		var iter = 4096
	}else if(entropy < 20){
		var iter = 2048
	}else if(entropy < 40){
		var iter = 1024
	}else if(entropy < 60){
		var iter = 512
	}else if(entropy < 80){
		var iter = 256
	}else{
		var iter = 2
	}

	return sjcl.codec.base64.fromBits(sjcl.misc.scrypt(pwd,salt,iter*CPUfactor,r,p,dkLen))

//to use a key derivation function other than scrypt, just change the line above, and the list of parameters in the function header
};