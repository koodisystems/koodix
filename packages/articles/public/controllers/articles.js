'use strict';

angular.module('mean').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Global', 'Articles', 'Socket',
    function($scope, $stateParams, $location, Global, Articles, Socket) {
        $scope.global = Global;

        /***** create the article container array *****/
        // $scope.articles = [];

        Socket.on('onArticleCreated', function(data) {
            console.log(data);
            if(!data.err) {
                $scope.articles.push(data);
            }
        });

        $scope.hasAuthorization = function(article) {
            if (!article || !article.user) return false;
            return $scope.global.isAdmin || article.user._id === $scope.global.user._id;
        };

        $scope.create = function(isValid) {
            console.log('create method called');

            if (isValid) { 
                console.log('isValid and about to create');
                //set article properties to the request body
                var article = {
                    title: this.title,
                    content: this.content
                };

                $scope.articles.push(article);

                Socket.emit('createArticle', article);

                // //call an ajax that saves the article on the server-side
                // article.$save(function(response) {
                //     $location.path('articles/' + response._id);
                // });

                this.title = '';
                this.content = '';
            } else {
                $scope.submitted = true;
            }
        };

        $scope.remove = function(article) {
            if (article) {
                article.$remove();

                for (var i in $scope.articles) {
                    if ($scope.articles[i] === article) {
                        $scope.articles.splice(i, 1);
                    }
                }
            } else {
                $scope.article.$remove(function(response) {
                    $location.path('articles');
                });
            }
        };

        $scope.update = function(isValid) {
            if (isValid) {
                var article = $scope.article;
                if (!article.updated) {
                    article.updated = [];
                }
                article.updated.push(new Date().getTime());

                article.$update(function() {
                    $location.path('articles/' + article._id);
                });
            } else {
                $scope.submitted = true;
            }
        };

        $scope.find = function() {
            Articles.query(function(articles) {
                $scope.articles = articles;
            });
        };

        $scope.findOne = function() {
            Articles.get({
                articleId: $stateParams.articleId
            }, function(article) {
                $scope.article = article;
            });
        };
    }
]);
