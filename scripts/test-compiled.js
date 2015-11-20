'use strict';

window.onload = function () {

    var Observable = Rx.Observable;

    var textbox = document.getElementById('textbox');

    var results = document.getElementById('results');

    var keypresses = Observable.fromEvent(textbox, 'keypress');

    var searchButton = document.getElementById('searchButton');
    var searchButtonClicks = Observable.fromEvent(searchButton, 'click');

    // keypresses.forEach(e => console.log(e.keyCode));

    function getWikipediaSearchResults(term) {
        return Observable.create(function forEach(observable) {
            var cancelled = false;

            var url = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + encodeURIComponent(term) + '&callback=?';

            $.getJSON(url, function (data) {
                if (!cancelled) {
                    observable.onNext(data[1]);
                    observable.onCompleted();
                }
            });

            return function dispose() {
                cancelled = true;
            };
        });
    }

    var searchFormOpens = searchButtonClicks.doAction(function onNext(v) {
        document.getElementById('searchForm').style.display = "block";
    });

    var searchResultSets = searchFormOpens.map(function () {
        var closeClicks = Observable.fromEvent(document.getElementById("closeButton"), 'click');
        var searchFormCloses = closeClicks.doAction(function () {
            document.getElementById('searchform').style.display = "none";
        });
        return keypresses.throttle(20).map(function (key) {
            return textbox.value;
        }).distinctUntilChanged().map(function (search) {

            return getWikipediaSearchResults(search).retry(3);
        }).switchLatest().takeUntil(searchFormCloses);
    }).switchLatest();

    searchResultSets.forEach(function (resultSet) {
        results.value = JSON.stringify(resultSet);
    }, function (error) {
        console.log(error);
    });

    getWikipediaSearchResults('France').forEach(function (results) {
        console.log(results);
    });
};

//# sourceMappingURL=test-compiled.js.map