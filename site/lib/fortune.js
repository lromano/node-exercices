var fortunesCookies = [
  "Conquer your fears or they will conquer you.",
  "Rivers need springs",
  "May the force be with you",
  "A Lannister always pays his debts",
  "Whenever possible, keep it simple"
];

exports.getFortune = function(){
  var idx = Math.floor(Math.random() * fortunesCookies.length);
  return fortunesCookies[idx];
};