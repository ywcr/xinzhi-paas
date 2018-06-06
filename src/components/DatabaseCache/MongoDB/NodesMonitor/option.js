/*
*Author:Dujingya
*Create time：2017-09-04 15:08
*Description:
*/

var data = [
    ["2000-06-05",116,123233],["2000-06-06",600],["2000-06-07",705],["2000-06-08",860],
    ["2000-06-09",73],["2000-06-10",85],["2000-06-11",73],["2000-06-12",68],
    ["2000-06-13",92],["2000-06-14",130],["2000-06-15",245],["2000-06-16",139],
    ["2000-06-17",115],["2000-06-18",111],["2000-06-19",309],["2000-06-20",206],
    ["2000-06-21",437],["2000-06-22",528],["2000-06-23",685],["2000-06-24",794],
    ["2000-06-25",271],["2000-06-26",306],["2000-06-27",584],["2000-06-28",193],
    ["2000-06-29",85],["2000-06-30",73],["2000-07-01",83],["2000-07-02",125],
    ["2000-07-03",107],["2000-07-04",82],["2000-07-05",44],["2000-07-06",72],
    ["2000-07-07",106],["2000-07-08",107],["2000-07-09",66],["2000-07-10",91],
    ["2000-07-11",92],["2000-07-12",113],["2000-07-13",107],["2000-07-14",131],
    ["2000-07-15",111],["2000-07-16",64],["2000-07-17",69],["2000-07-18",88],
    ["2000-07-19",77],["2000-07-20",83],["2000-07-21",111],["2000-07-22",57],
    ["2000-07-23",55],["2000-07-24",60]];

var dateList = data.map(function (item) {
    return item[0];
});
var valueList = data.map(function (item) {
    return item[1];
});


export const lineOption = {
    visualMap: [{
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        min: 0,
        max: 1000
    }],
    title: [{
        left: 'center',
        text: 'Gradient along the y axis'
    }],
    tooltip: {
        trigger: 'axis'
    },
    xAxis: [{
        data: dateList
    }],
    yAxis: [{
        splitLine: {show: false}
    }],
    grid: [{
        bottom: '60%'
    }, {
        top: '60%'
    }],
    series: [{
        type: 'line',
        showSymbol: false,
        data: valueList
    }]
};



// export  const  lineOption=(data)=>{
//       return  option
// }

