Example JSON for adding matches:

```json

{
	"match":{
		"is_team":false,
		"date":"2018-07-14T12:21:50.193Z",
		"stocks":3,
		"time":"00:06:00",
		"time_remaining":"00:02:14",
		"stage_id":1,
		"author_user_id": 1
	},
	"players":[
		{
			"user_id": 1,
			"character_id":1,
			"team_id":null,
			"is_winner":true,
			"data": [
				{"key": "stocks", "value": 2}
			]
		},
		{
			"user_id":2,
			"character_id":2,
			"team_id":null,
			"is_winner":false,
			"data": [
				{"key": "stocks", "value": 1}
			]
		}
	]

}

``` 