
// 取得当前职位岗位信息
var getCur2PInfo = function() {
  return {
    "post_id": 9,
    "post_name": "岗位008",
    "position_id": 66,
    "position_name": "职位20"
  }
};
exports.getCur2PInfo = getCur2PInfo;

// 取得晋升信息(将取得上级职位与转岗信息合并在一起)
var getPromotionLine = function() {
  return {
    "position": {
      "desc": "职位描述",
      "position_id": 68,
      "position_name": "职位2001"
    },
    "posts": [
      {
        "desc": "岗位描述",
        "post_id": 9,
        "post_name": "岗位008"
      },
      {
        "desc": null,
        "post_id": 86,
        "post_name": "岗位00884"
      },
      {
        "desc": "1234",
        "post_id": 97,
        "post_name": "岗位00385"
      },
      {
        "desc": "岗位描述",
        "post_id": 99,
        "post_name": "岗位0098"
      },
      {
        "desc": null,
        "post_id": 100,
        "post_name": "岗位0064"
      },
      {
        "desc": null,
        "post_id": 101,
        "post_name": "岗位658"
      }
    ]
  }
};
exports.getPromotionLine = getPromotionLine;

// 职位能力要求及推荐课程
var getPosiAbiDemandAndDesc = function() {
  return {
    "desc": "职位描述",
    "courses": [
      {
        "course_id": 1,
        "course_name": "java课程1",
        "lectuter_id": 1,
        "lecturer_name": "张教授",
        "course_pic_url": "/upload/course/pic/123.jpg"
      },
      {
        "course_id": 2,
        "course_name": "java课程2",
        "lectuter_id": 2,
        "lecturer_name": "王教授",
        "course_pic_url": null
      }
    ],
    "abi_demands": [
      {
        "abi_demand_id": 59,
        "ali_demand_name": "codeNameTest7"
      },
      {
        "abi_demand_id": 63,
        "ali_demand_name": "331"
      },
      {
        "abi_demand_id": 84,
        "ali_demand_name": "99"
      }
    ]
  };
};
exports.getPosiAbiDemandAndDesc = getPosiAbiDemandAndDesc;

// 岗位能力要求及推荐课程
var getPostAbiDemandAndDesc = function() {
  return {
    "desc": "岗位描述",
    "courses": [
      {
        "course_id": 1,
        "course_name": "java课程1",
        "lectuter_id": 1,
        "lecturer_name": "张教授",
        "course_pic_url": "/upload/course/pic/123.jpg"
      },
      {
        "course_id": 2,
        "course_name": "java课程2",
        "lectuter_id": 2,
        "lecturer_name": "王教授",
        "course_pic_url": null
      }
    ],
    "abi_demands": [
      {
        "abi_demand_id": 59,
        "ali_demand_name": "codeNameTest7"
      },
      {
        "abi_demand_id": 63,
        "ali_demand_name": "331"
      }
    ]
  };
};
exports.getPostAbiDemandAndDesc = getPostAbiDemandAndDesc;

// 岗位职位对应关系
var getPosiByPost = function() {
  return {
    "positions": [
      {
        "desc": "teststse",
        "position_id": 109,
        "position_name": "职位709"
      },
      {
        "desc": "",
        "position_id": 110,
        "position_name": "1"
      },
      {
        "desc": "",
        "position_id": 116,
        "position_name": "122"
      },
      {
        "desc": "",
        "position_id": 116,
        "position_name": "122"
      },
      {
        "desc": "",
        "position_id": 117,
        "position_name": "11111111111111111"
      },
      {
        "desc": "",
        "position_id": 117,
        "position_name": "11111111111111111"
      }
    ]
  };
};
exports.getPosiByPost = getPosiByPost;

// 生成职涯线路
var createCareerLine = function() {
  return {
  };
};
exports.createCareerLine = createCareerLine;

// 取得职涯管理列表
var listCareerLines = function() {
  return  {
    "lines": [
      {
        "line_id": 1,
        "items": [
          {
            "post_id": 9,
            "post_name": "岗位008",
            "position_id": 110,
            "position_name": "1"
          },
          {
            "post_id": 109,
            "post_name": "岗位312",
            "position_id": null,
            "position_name": null
          }
        ]
      },
      {
        "line_id": 2,
        "items": [
          {
            "post_id": 9,
            "post_name": "岗位008",
            "position_id": 110,
            "position_name": "1"
          },
          {
            "post_id": 109,
            "post_name": "岗位312",
            "position_id": null,
            "position_name": null
          }
        ]
      }
    ]
  };
};
exports.listCareerLines = listCareerLines;

// 删除职涯线路
var deleteCareerLine = function() {
  return  {
  };
};
exports.deleteCareerLine = deleteCareerLine;

