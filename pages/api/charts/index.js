import {data} from "./datasource"

export default function handler(req, res) {
    const { gender, endDate, startDate, age } = req.query
    const genderDate = gender
    const endDateData = endDate
    const startDateData = startDate
    const ageDate = age

    function parseDate(dateString) {
        const [day, month, year] = dateString.split('/')
        return new Date(`${year}-${month}-${day}`).getTime()
    }
    
    function dateComparison(startDateData, endDateData, objDate) {
        const sd = parseDate(startDate)
        const ed = parseDate(endDate)
        const od = parseDate(objDate)
        
        if (od <= ed && od >= sd) {
            return true;
        } else {
            return false;
        }
    }
    
    
    const filteredEffect = data.filter(elem => genderDate.includes(elem.Gender) && ageDate.includes(elem.Age) && dateComparison(startDateData, endDateData, elem.Day))
    const combineData = (data) => {
        let dates = []
        const finalArr = []
        
        for (let date of data) {
            if (!dates.includes(date.Day)) dates.push(date.Day)
        }
        
        for (let day of dates) {
            let toPush = {A: 0, B: 0, C: 0, D: 0, E: 0, F:0}
            for (let obj of data) {
                toPush["Day"] = day
                if (obj.Day == day) {
                    toPush["A"] += Number(obj.A)
                    toPush["B"] += Number(obj.B)
                    toPush["C"] += Number(obj.C)
                    toPush["D"] += Number(obj.D)
                    toPush["E"] += Number(obj.E)
                    toPush["F"] += Number(obj.F)
                }
            }
            finalArr.push(toPush)
            toPush = {}
        }
        return finalArr
    }
    
    const features = ['A', 'B', 'C', 'D', 'E', 'F']
    const totalTimeSpent = features.map(feature => ({
                    feature: feature,
                    total: filteredEffect.reduce((prev, current) => prev + parseInt(current[feature] || 0), 0)
                }));
    const lineChartData = combineData(filteredEffect)

    res.status(200).json({totalTimeSpent, lineChartData})
}
