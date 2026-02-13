// ========================================
// 匹配算法工具函数
// ========================================

import { KNOWLEDGE_BASE } from '@/data/knowledge'

// 获取学历提升建议
export function getSuggestion(profile) {
  const userEdu = profile.currentEducation
  const targetDegree = profile.targetDegree
  
  if (targetDegree === '硕士') {
    if (['高中', '中专', '技校'].includes(userEdu)) {
      return '您目前是' + userEdu + '学历，想要攻读硕士学位，建议您先提升学历至本科或大专，然后再申请硕士项目。推荐路径：' + userEdu + ' → 大专/本科 → 硕士'
    }
    if (userEdu === '初中') {
      return '您目前是初中学历，想要攻读硕士学位，建议您按以下路径逐步提升：初中 → 中专 → 大专/本科 → 硕士'
    }
  }
  
  if (targetDegree === '博士') {
    if (['高中', '中专', '技校', '大专', '初中'].includes(userEdu)) {
      return '您目前是' + userEdu + '学历，想要攻读博士学位，建议您先提升学历至硕士，然后再申请博士项目。'
    }
    if (userEdu === '本科') {
      return '您目前是本科学历，想要攻读博士学位，建议您先提升学历至硕士，然后再申请博士项目。'
    }
  }
  
  return '根据您的情况，暂时没有找到完全匹配的项目，建议您联系顾问老师获取个性化方案。'
}

// 判断专业是否匹配用户意向
export function matchMajorInterest(major, interest) {
    // 医学/护理的精确匹配
    if (interest.includes('医') || interest.includes('护理')) {
    // 精确匹配的专业列表
    const validMedicalMajors = ['护理', '护理学', '临床医学', '口腔医学', '中医学', '中医', '康复治疗', '医学检验', '医学影像', '针灸推拿']
    
    // 检查是否精确匹配
    const isValid = validMedicalMajors.some(m => major.includes(m))
    
    // 排除规则
    const isExcluded = major.includes('动物医学') || major.includes('制药') || major.includes('药学') || major.includes('中药')
    
    return isValid && !isExcluded
    }
  if (interest.includes('教育') || interest.includes('师范')) {
    return major.includes('教育') || major.includes('师范') || major.includes('学前')
  }
  if (interest.includes('管理') || interest.includes('工商')) {
    return major.includes('管理') || major.includes('工商')
  }
  if (interest.includes('计算机') || interest.includes('信息') || interest.includes('it')) {
    return major.includes('计算机') || major.includes('信息') || major.includes('技术') || major.includes('数据')
  }
  if (interest.includes('建筑') || interest.includes('工程')) {
    // 精确匹配建筑工程相关专业
    const validConstructionMajors = ['建筑', '土木', '工程管理', '工程造价', '建设工程', '房地产', '城乡规划', '风景园林']
    const isValid = validConstructionMajors.some(m => major.includes(m))
    
    // 排除非建筑类的工程专业
    const isExcluded = major.includes('制药工程') || 
                       major.includes('生物工程') || 
                       major.includes('化学工程') ||
                       major.includes('环境工程') ||
                       major.includes('软件工程') ||
                       major.includes('网络工程') ||
                       major.includes('电气工程') ||
                       major.includes('机械工程') ||
                       major.includes('电子工程') ||
                       major.includes('计算机') ||
                       major.includes('信息工程')
    
    return isValid && !isExcluded
  }
  if (interest.includes('会计') || interest.includes('财务') || interest.includes('金融')) {
    return major.includes('会计') || major.includes('金融') || major.includes('财')
  }
  if (interest.includes('法') || interest.includes('法律')) {
    return major.includes('法')
  }
  if (interest.includes('艺术') || interest.includes('设计') || interest.includes('音乐') || interest.includes('美术')) {
    return major.includes('艺术') || major.includes('音乐') || major.includes('美术') || major.includes('设计')
  }
  if (interest.includes('新闻') || 
      interest.includes('传播') || 
      interest.includes('广告') || 
      interest.includes('编辑') || 
      interest.includes('媒体')) {
    return major.includes('新闻') || 
           major.includes('传播') || 
           major.includes('广告') || 
           major.includes('编辑') || 
           major.includes('媒体') || 
           major.includes('广播电视') ||
           major.includes('出版')
  }
  return false
}

// 获取专业匹配优先级（数字越大优先级越高）
export function getMajorPriority(major, interest) {
  const majorLower = major.toLowerCase()
  
  if (interest.includes('医') || interest.includes('护理')) {
    if (majorLower.includes('护理')) return 100        // 护理学最高优先级
    if (majorLower.includes('临床医学')) return 90
    if (majorLower.includes('口腔医学')) return 85
    if (majorLower.includes('中医学') || majorLower.includes('中医')) return 80
    if (majorLower.includes('康复')) return 70
    if (majorLower.includes('医学')) return 60         // 其他医学类
    return 0  // 医学类不匹配返回0
  }
  
  if (interest.includes('建筑') || interest.includes('工程')) {
    if (majorLower.includes('建筑学') || majorLower.includes('建筑工程')) return 100
    if (majorLower.includes('土木工程')) return 95
    if (majorLower.includes('工程管理')) return 90
    if (majorLower.includes('工程造价')) return 85
    if (majorLower.includes('建设工程')) return 80
    if (majorLower.includes('房地产')) return 75
    if (majorLower.includes('城乡规划') || majorLower.includes('风景园林')) return 70
    // 排除非建筑类工程
    if (majorLower.includes('制药工程') || 
        majorLower.includes('生物工程') ||
        majorLower.includes('化学工程') ||
        majorLower.includes('软件工程')) return 0
    return 0
  }
  
  // 其他专业类别可以类似处理...
  return matchMajorInterest(majorLower, interest) ? 50 : 0
}

// 核心匹配函数
export function matchPrograms(profile) {
  let results = []
  
  // 根据目标学历筛选
  if (profile.targetDegree === '中专') {
    results = [...KNOWLEDGE_BASE.zhongzhuan]
  } else if (profile.targetDegree === '大专') {
    results = [...KNOWLEDGE_BASE.dazhuan]
  } else if (profile.targetDegree === '本科') {
    results = [...KNOWLEDGE_BASE.benke]
  } else if (profile.targetDegree === '硕士') {
    results = [...KNOWLEDGE_BASE.domestic_master, ...KNOWLEDGE_BASE.overseas_master]
  } else if (profile.targetDegree === '博士') {
    results = [...KNOWLEDGE_BASE.overseas_doctor]
  }
  
  // 根据用户当前学历筛选符合报名条件的院校
  if (profile.currentEducation) {
    const userEdu = profile.currentEducation
    
    results = results.filter(p => {
      const req = p.requirement.toLowerCase()
      
      // 用户是初中学历
      if (userEdu === '初中') {
        return req.includes('初中')
      }
      
      // 用户是高中/中专/技校学历
      if (['高中', '中专', '技校'].includes(userEdu)) {
        return req.includes('高中') || req.includes('中专') || req.includes('技校') || 
            req.includes('高起') || req.includes('初中')
      }
      
      // 用户是大专学历
      if (userEdu === '大专') {
        return req.includes('大专') || req.includes('专科') || req.includes('专升')
      }
      
      // 用户是本科学历
      if (userEdu === '本科') {
        return req.includes('本科') || req.includes('大专') || req.includes('专科')
      }
      
      // 用户是硕士学历
      if (userEdu === '硕士') {
        return req.includes('硕士') || req.includes('本科')
      }
      
      return true
    })
  }

  // 如果用户指定了具体院校，优先匹配该院校
  if (profile.schoolPreference && 
      profile.schoolPreference !== '暂无' && 
      profile.schoolPreference !== '暂不确定') {
    const preferredSchool = profile.schoolPreference.toLowerCase()
    const schoolMatched = results.filter(p => 
      p.school.toLowerCase().includes(preferredSchool) ||
      preferredSchool.includes(p.school.toLowerCase())
    )
    
    // 如果找到匹配的院校，将其排在前面
    if (schoolMatched.length > 0) {
      const otherResults = results.filter(p => 
        !p.school.toLowerCase().includes(preferredSchool) &&
        !preferredSchool.includes(p.school.toLowerCase())
      )
      results = [...schoolMatched, ...otherResults]
    }
  }

  // 按意向专业筛选
  if (profile.majorInterest && profile.majorInterest !== '不限' && profile.majorInterest !== '暂不确定') {
    const interest = profile.majorInterest.toLowerCase()
    results = results.filter(p => {
      const majorsStr = p.majors.join(',').toLowerCase()
      if (interest.includes('医') || interest.includes('护理')) {
        // 必须包含真正的医学/护理专业
        const hasValidMedical = majorsStr.includes('护理') || 
                                majorsStr.includes('临床医学') || 
                                majorsStr.includes('口腔医学') || 
                                majorsStr.includes('中医学') ||
                                majorsStr.includes('康复治疗') ||
                                majorsStr.includes('医学检验') ||
                                majorsStr.includes('医学影像')
        
        // 排除只有"制药工程"或"动物医学"的院校
        const onlyExcluded = !hasValidMedical && (majorsStr.includes('制药') || majorsStr.includes('动物医学'))
        
        return hasValidMedical && !onlyExcluded
      }
      if (interest.includes('教育') || interest.includes('师范')) {
        return majorsStr.includes('教育') || majorsStr.includes('师范')
      }
      if (interest.includes('管理') || interest.includes('工商')) {
        return majorsStr.includes('管理') || majorsStr.includes('工商')
      }
      if (interest.includes('计算机') || interest.includes('信息') || interest.includes('IT')) {
        return majorsStr.includes('计算机') || majorsStr.includes('信息') || majorsStr.includes('技术')
      }
      if (interest.includes('建筑') || interest.includes('工程')) {
        // 必须包含真正的建筑工程专业
        const hasValidConstruction = majorsStr.includes('建筑') || 
                                     majorsStr.includes('土木') ||
                                     majorsStr.includes('工程管理') ||
                                     majorsStr.includes('工程造价') ||
                                     majorsStr.includes('建设工程')
        
        // 排除只有非建筑类工程的院校
        const onlyExcluded = !hasValidConstruction && (
          majorsStr.includes('制药工程') || 
          majorsStr.includes('生物工程') ||
          majorsStr.includes('化学工程') ||
          majorsStr.includes('软件工程') ||
          majorsStr.includes('网络工程')
        )
        
        return hasValidConstruction && !onlyExcluded
      }
      if (interest.includes('会计') || interest.includes('财务') || interest.includes('金融')) {
        return majorsStr.includes('会计') || majorsStr.includes('金融') || majorsStr.includes('财')
      }
      if (interest.includes('法') || interest.includes('法律')) {
        return majorsStr.includes('法')
      }
      if (interest.includes('艺术') || interest.includes('设计') || interest.includes('音乐') || interest.includes('美术')) {
        return majorsStr.includes('艺术') || majorsStr.includes('音乐') || majorsStr.includes('美术') || majorsStr.includes('设计')
      }
      if (interest.includes('新闻') || 
        interest.includes('传播') || 
        interest.includes('广告') || 
        interest.includes('编辑') || 
        interest.includes('媒体')) {
      return majorsStr.includes('新闻') || 
            majorsStr.includes('传播') || 
            majorsStr.includes('广告') || 
            majorsStr.includes('编辑') || 
            majorsStr.includes('媒体') || 
            majorsStr.includes('广播电视') ||
            majorsStr.includes('出版')
    }
      return true
    })
  }
  
  // 按意向学校筛选
  if (profile.schoolPreference && profile.schoolPreference !== '不限' && profile.schoolPreference !== '暂不确定') {
    const schoolPref = profile.schoolPreference.toLowerCase()
    if (schoolPref.includes('国内')) {
      results = results.filter(p => p.country === '中国')
    } else if (schoolPref.includes('国外') || schoolPref.includes('境外') || schoolPref.includes('留学')) {
      results = results.filter(p => p.country !== '中国')
    }
  }
  
  // 计算匹配度评分并排序，同时对专业进行重排序
  results = results.map(p => {
    let score = 70
    
    // 费用越低分越高
    if (p.tuition < 50000) score += 15
    else if (p.tuition < 100000) score += 10
    else if (p.tuition < 150000) score += 5
    
    // 学制越短分越高
    if (p.duration.includes('1年')) score += 10
    else if (p.duration.includes('2年') || p.duration.includes('2.5年')) score += 5
    
    // 特色加分
    if (p.features && p.features.length > 2) score += 5
    
    // 对专业进行重排序，将用户意向专业排在第一位
    let sortedMajors = [...p.majors]
    if (profile.majorInterest && profile.majorInterest !== '不限' && profile.majorInterest !== '暂不确定') {
    const interest = profile.majorInterest.toLowerCase()
    
    // 分离匹配的专业和不匹配的专业
    const matchedMajors = []
    const unmatchedMajors = []
    
    // 按优先级排序专业
    sortedMajors.sort((a, b) => {
    const priorityA = getMajorPriority(a, interest)
    const priorityB = getMajorPriority(b, interest)
    return priorityB - priorityA  // 优先级高的排前面
    })
    }
    
    return { ...p, majors: sortedMajors, matchScore: Math.min(score, 98) }
  })
  
  results.sort((a, b) => b.matchScore - a.matchScore)

  // 如果用户指定了意向院校且在知识库中，确保该院校排在最前面
  if (profile.schoolPreference && 
      profile.schoolPreference !== '暂无' && 
      profile.schoolPreference !== '暂不确定' &&
      !profile.schoolNotInDatabase) {
    const preferredSchool = profile.schoolPreference.toLowerCase()
    const preferredIndex = results.findIndex(p => 
      p.school.toLowerCase().includes(preferredSchool) ||
      preferredSchool.includes(p.school.toLowerCase())
    )
    
    if (preferredIndex > 0) {
      const [preferredProgram] = results.splice(preferredIndex, 1)
      results.unshift(preferredProgram)
    }
  }

  // 检查意向院校相关信息
  let schoolHasMajor = true
  let schoolInDatabase = true
  let schoolHasTargetDegree = true

  if (profile.schoolPreference && 
      profile.schoolPreference !== '暂无' && 
      profile.schoolPreference !== '暂不确定') {
    
    const preferredSchool = profile.schoolPreference.toLowerCase()
    
    // 获取所有知识库中的院校（不限学历层次）
    const allSchools = [
      ...KNOWLEDGE_BASE.zhongzhuan,
      ...KNOWLEDGE_BASE.dazhuan,
      ...KNOWLEDGE_BASE.benke,
      ...KNOWLEDGE_BASE.domestic_master,
      ...KNOWLEDGE_BASE.overseas_master,
      ...KNOWLEDGE_BASE.overseas_doctor
    ]
    
    // 检查意向院校是否在整个知识库中
    const schoolExistsInAllDB = allSchools.some(p => 
      p.school.toLowerCase().includes(preferredSchool) ||
      preferredSchool.includes(p.school.toLowerCase())
    )
    
    // 检查意向院校是否在当前目标学历的结果中
    const matchedSchool = results.find(p => 
      p.school.toLowerCase().includes(preferredSchool) ||
      preferredSchool.includes(p.school.toLowerCase())
    )
    
    if (!schoolExistsInAllDB) {
      schoolInDatabase = false
    } else if (!matchedSchool) {
      schoolInDatabase = true
      schoolHasTargetDegree = false
    } else if (profile.majorInterest && 
            profile.majorInterest !== '不限' && 
            profile.majorInterest !== '暂不确定') {
      const interest = profile.majorInterest.toLowerCase()
      const hasMajor = matchedSchool.majors.some(m => 
        matchMajorInterest(m.toLowerCase(), interest)
      )
      schoolHasMajor = hasMajor
    }
  }

    // 检查意向院校情况
    let schoolMessage = null
    const preferredSchool = profile.schoolPreference?.toLowerCase() || ''

    // 判断是否输入了具体院校名称（排除选项）
    const isSpecificSchool = preferredSchool && 
    !['国内院校', '境外留学', '暂不确定', '不限'].includes(profile.schoolPreference)

    if (isSpecificSchool) {
    // 获取所有知识库中的院校
    const allSchools = [
        ...KNOWLEDGE_BASE.zhongzhuan,
        ...KNOWLEDGE_BASE.dazhuan,
        ...KNOWLEDGE_BASE.benke,
        ...KNOWLEDGE_BASE.domestic_master,
        ...KNOWLEDGE_BASE.overseas_master,
        ...KNOWLEDGE_BASE.overseas_doctor
    ]

    // 查找意向院校是否存在
    const foundSchool = allSchools.find(p => 
        p.school.toLowerCase().includes(preferredSchool) ||
        preferredSchool.includes(p.school.toLowerCase())
    )

    if (foundSchool) {
    // 先检查该院校是否有对应的目标学历（在allSchools中查找，而非results）
    const schoolInTargetLevel = allSchools.find(p =>
      (p.school.toLowerCase().includes(preferredSchool) ||
      preferredSchool.includes(p.school.toLowerCase())) &&
      p.level === profile.targetDegree
    )
    
    if (!schoolInTargetLevel) {
      // 院校存在但没有该学历层次
      schoolMessage = `抱歉，「${profile.schoolPreference}」目前只有${foundSchool.level}层次的项目，暂无${profile.targetDegree}项目。`
    } else if (profile.majorInterest && profile.majorInterest !== '暂不确定') {
      // 检查是否有意向专业（使用schoolInTargetLevel而非从results中找）
      const hasMajor = schoolInTargetLevel.majors.some(m => 
        matchMajorInterest(m.toLowerCase(), profile.majorInterest.toLowerCase())
      )
      if (!hasMajor) {
        // 获取意向院校的所有专业，供提示使用
        const schoolMajors = schoolInTargetLevel.majors.slice(0, 5).join('、')
        schoolMessage = `「${profile.schoolPreference}」${profile.targetDegree}层次暂无${profile.majorInterest}相关专业（该校开设专业：${schoolMajors}等）。\n\n已为您按匹配度推荐其他院校的${profile.majorInterest}相关专业：`
      }
    }
    } else {
        // 院校不在知识库中
        schoolMessage = `抱歉，「${profile.schoolPreference}」暂不在我们的合作院校中，已为您推荐其他优质院校。`
    }
    }

  return {
    programs: results,
    needUpgradeFirst: results.length === 0,
    suggestion: results.length === 0 ? getSuggestion(profile) : null,
    schoolInDatabase: schoolInDatabase,
    schoolHasMajor: schoolHasMajor,
    schoolHasTargetDegree: schoolHasTargetDegree,
    schoolMessage: schoolMessage
  }
}

// 格式化学费显示
export function formatTuition(tuition, tuitionMax) {
  if (tuitionMax && tuitionMax !== tuition) {
    return `${tuition.toLocaleString()} - ${tuitionMax.toLocaleString()}元/年`
  }
  return `${tuition.toLocaleString()}元/年`
}