var fortunes = [
	"Couqure your fears or they will conquer you.",
	"Rivers need springs.",
	"Do not fear what you don't know.",
	"Whenever possible, keep it simple."
];

exports.getFortune = function(){
	var idx=Math.floor(Math.random() * fortunes.length);
	return fortunes[idx];
};