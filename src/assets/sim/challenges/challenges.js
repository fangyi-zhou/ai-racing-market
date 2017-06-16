/**
 * Created by ruiaohu on 27/05/2017.
 */
const maxLevel = 4;
var userLevel;

function initChallenge2(userLevel) {
    let progressBar = document.getElementById('progressbar');
    console.log(progressBar)
    userLevel = 2
    progressBar.value = progressBar.max * (userLevel / maxLevel);
};
