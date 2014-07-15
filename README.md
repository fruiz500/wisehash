WiseHash
========

Variable key stretching with fast dictionary-based entropy calculation

  WiseHash is a small piece of javascript code that implements variable
  key stretching based on a measurement of the information entropy of
  the input string. It can be used as a key derivation function client-side,
  or server-side in node.js websites, with the following desirable features:
  
  o	Weak keys are stretched more than strong ones, and therefore made
	more secure.
  o	Using weak keys leads to a slower user experience, thus encouraging
	users to change to strong keys.
  o	Since weak keys are not entirely disallowed, they remain in the 
	keyspace, causing would-be hackers to expend considerable resources
	in scanning the keyspace, or else risk missing the weakest keys.
  o	Key strength is determined not only from the kinds of characters
	used, but also from dictionary matches.
  o	A distinction is made between common words in the dictionary and
	words that are commonly used in passwords. The latter lead to 
	using more keystretching iterations.
  o	Common substitutions (such as "$" for "s") are taken into account.
  o	The key is scored based on the true value of its information
	entropy, which can be obtained as an output.
  o	This release includes English dictionaries, but changing to
	a different language merely involves one file.
		
  WiseHash uses the scrypt key derivation function, but changing to
  pbkdf2, bcrypt, or some other merely involves changing one line in
  the code (duly noted by a comment). The sample code is
  client-based, but the sharp developer will be able to use it along
  with server-side code without any trouble.
  
Usage
  
  To output the information entropy of a key (string):

	var entropy = WiseHashEntropy(key)
	
  The output is a floating-point number with at most two decimal figures,
  representing the information entropy, in bits.
  
  If you are doing key derivation server-side, you would still do the 
  entropy calculation client-side by calling WiseHashEntropy, and then
  submit the result to the server along with the key itself so the server
  does more stretching for keys of lower entropy. You may want to
  add a spurious client-side delay as in the example, to make users
  feel the pain of having chosen a weak key.
  
  To stretch a key (string) using WiseHash:
  
	var keystretched = WiseHashScrypt(key,salt,CPUfactor,r,p,dkLen)
	
  where salt is a string, CPUfactor is a power of 2, r and p are integer
  parameters used in scrypt, and dkLen is the length of the stretched key,
  in words (8 bits). The output is in base64 characters by default, though this
  is easy to change. Switching to a key derivation function other than scrypt
  is done by editing the same line.
  
  CPUfactor tells WiseHash to add more iterations to scrypt, likely as a result
  of running on more powerful machines. A value of 1 tells WiseHash to use iteration
  counts optimized for mobile devices. A value of 2 means twice as many, and so forth.
  Scrypt only admits iteration counts that are a power of 2, and so CPUfactor should
  be a power of 2 if scrypt is retained as the core key derivation function.

Changing the dictionary

  The included dictionary_en.js was made for English, but it is easy to make
  a version for another language. Here is what you do:
  
  1. get a list of the most frequent words in that language; this will be
  used to make the variable "wordlist".
  
  2. if available, get a list for the most frequently used passwords; this
  will form the basis of the variable "blacklist".
  
  3. copy them both into a javascript console and make arrays for them, which
  is as simple as adding .split(' ') to the space-separated lists.
  
  4. order the lists by size, from larger to smaller; this can be done,
  for instance, with:
  
  blacklist.sort(function (a, b) { return b.length - a.length; });
  wordlist.sort(function (a, b) { return b.length - a.length; })
  
  5. remove duplicate words in wordlist that are also in blacklist.
  For instance, enter this:
  
  Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});};
	
  And then:
  
  wordlist.diff(blacklist)
  
  6. Return the arrays back to string:
  
  blacklist.join(' ');
  wordlist.join(' ')
  
  7. Apply common substitutions to the strings:
  
  blacklist.toLowerCase().replace(/[óòöôõo]/g,'0').replace(/[!íìïîi]/g,'1')
  .replace(/[z]/g,'2').replace(/[éèëêe]/g,'3').replace(/[@áàäâãa]/g,'4')
  .replace(/[$s]/g,'5').replace(/[t]/g,'7').replace(/[b]/g,'8').replace(/[g]/g,'9')
  .replace(/[úùüû]/g,'u');
  
  and a similar one for wordlist. Then copy both resulting strings to the
  dictionary file.

  The Spanish dictionary file dictionary_es.js was made using this process.
License

  Copyright (C) 2014 Francisco Ruiz

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.

Acknowledgements

  WiseHash contains code from a number of open source
  projects, some of them on GitHub, including the Stanford JavaScript
  Cryptography Library (SJCL), and scrypt.js.
