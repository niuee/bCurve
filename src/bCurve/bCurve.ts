import { PointCal } from "point2point";
import { Line } from "../line";

const T = [
    -0.0640568928626056260850430826247450385909,
    0.0640568928626056260850430826247450385909,
    -0.1911188674736163091586398207570696318404,
    0.1911188674736163091586398207570696318404,
    -0.3150426796961633743867932913198102407864,
    0.3150426796961633743867932913198102407864,
    -0.4337935076260451384870842319133497124524,
    0.4337935076260451384870842319133497124524,
    -0.5454214713888395356583756172183723700107,
    0.5454214713888395356583756172183723700107,
    -0.6480936519369755692524957869107476266696,
    0.6480936519369755692524957869107476266696,
    -0.7401241915785543642438281030999784255232,
    0.7401241915785543642438281030999784255232,
    -0.8200019859739029219539498726697452080761,
    0.8200019859739029219539498726697452080761,
    -0.8864155270044010342131543419821967550873,
    0.8864155270044010342131543419821967550873,
    -0.9382745520027327585236490017087214496548,
    0.9382745520027327585236490017087214496548,
    -0.9747285559713094981983919930081690617411,
    0.9747285559713094981983919930081690617411,
    -0.9951872199970213601799974097007368118745,
    0.9951872199970213601799974097007368118745,
];

const C = [
    0.1279381953467521569740561652246953718517,
    0.1279381953467521569740561652246953718517,
    0.1258374563468282961213753825111836887264,
    0.1258374563468282961213753825111836887264,
    0.121670472927803391204463153476262425607,
    0.121670472927803391204463153476262425607,
    0.1155056680537256013533444839067835598622,
    0.1155056680537256013533444839067835598622,
    0.1074442701159656347825773424466062227946,
    0.1074442701159656347825773424466062227946,
    0.0976186521041138882698806644642471544279,
    0.0976186521041138882698806644642471544279,
    0.086190161531953275917185202983742667185,
    0.086190161531953275917185202983742667185,
    0.0733464814110803057340336152531165181193,
    0.0733464814110803057340336152531165181193,
    0.0592985849154367807463677585001085845412,
    0.0592985849154367807463677585001085845412,
    0.0442774388174198061686027482113382288593,
    0.0442774388174198061686027482113382288593,
    0.0285313886289336631813078159518782864491,
    0.0285313886289336631813078159518782864491,
    0.0123412297999871995468056670700372915759,
    0.0123412297999871995468056670700372915759,
];

export class bCurve{

    private controlPoints: Point[];
    private dControlPoints: Point[] = [];

    constructor(controlPoints: Point[]){
        this.controlPoints = controlPoints;
        this.dControlPoints = this.getDerivativeControlPoints(this.controlPoints);
    }

    public getDerivativeControlPoints(controlPoints: Point[]): Point[]{
        const derivativeControlPoints: Point[] = [];
        for(let index = 1; index < controlPoints.length; index++){
            derivativeControlPoints.push(PointCal.multiplyVectorByScalar(PointCal.subVector(controlPoints[index], controlPoints[index - 1]), controlPoints.length - 1));
        }
        return derivativeControlPoints;
    }

    private validateTVal(tVal: number){
        if (tVal > 1 || tVal < 0){
            throw new TValOutofBoundError("tVal is greater than 1 or less than 0");
        }
    }

    public getControlPoints(): Point[]{
        return this.controlPoints;
    }

    public setControlPointAtIndex(index: number, newPoint: Point): boolean{
        if (index < 0 || index >= this.controlPoints.length){
            return false;
        }
        this.controlPoints[index] = newPoint;
        this.dControlPoints = this.getDerivativeControlPoints(this.controlPoints);
        return true;
    }

    public compute(tVal: number): Point{
        this.validateTVal(tVal);
        let points = this.controlPoints;
        while (points.length > 1) {
            let lowerLevelPoints = points.slice(1);
            for(let index = 0; index < lowerLevelPoints.length; index++){
                lowerLevelPoints[index] = PointCal.addVector(PointCal.multiplyVectorByScalar(points[index], (1 - tVal)), PointCal.multiplyVectorByScalar(points[index + 1], tVal));
            }
            points = lowerLevelPoints;
        }
        return points[0];
    }

    private computeWithControlPoints(tVal: number, controlPoints: Point[]): Point{
        this.validateTVal(tVal);
        let points = controlPoints;
        while (points.length > 1) {
            let lowerLevelPoints = points.slice(1);
            for(let index = 0; index < lowerLevelPoints.length; index++){
                lowerLevelPoints[index] = PointCal.addVector(PointCal.multiplyVectorByScalar(points[index], (1 - tVal)), PointCal.multiplyVectorByScalar(points[index + 1], tVal));
            }
            points = lowerLevelPoints;
        }
        return points[0];

    }

    public get(tVal: number): Point {
        this.validateTVal(tVal);
        if (this.controlPoints.length == 3) {
            let firstTerm = PointCal.multiplyVectorByScalar(this.controlPoints[0], (1 - tVal) * (1 - tVal));
            let secondTerm = PointCal.multiplyVectorByScalar(this.controlPoints[1], 2 * (1 - tVal) * tVal);
            let thirdTerm = PointCal.multiplyVectorByScalar(this.controlPoints[2], tVal * tVal);
            let res = PointCal.addVector(PointCal.addVector(firstTerm, secondTerm), thirdTerm);
            return res;
        }
        if (this.controlPoints.length == 4){
            let firstTerm = PointCal.multiplyVectorByScalar(this.controlPoints[0], (1 - tVal) * (1 - tVal) * (1 - tVal));
            let secondTerm = PointCal.multiplyVectorByScalar(this.controlPoints[1], 3 * (1 - tVal) * (1 - tVal) * tVal);
            let thirdTerm = PointCal.multiplyVectorByScalar(this.controlPoints[2], 3 * (1 - tVal) * tVal * tVal);
            let forthTerm = PointCal.multiplyVectorByScalar(this.controlPoints[3], tVal * tVal * tVal);
            let res = PointCal.addVector(PointCal.addVector(firstTerm, secondTerm), PointCal.addVector(thirdTerm, forthTerm));
            return res;
        }
        return this.compute(tVal);
    }

    public getLUT(steps?: number){
        if (steps == undefined){
            steps = 100;
        }
        const stepSpan = 1 / steps;
        const res: Point[] = [];
        for(let tVal = 0; tVal <= 1; tVal += stepSpan){
            res.push(this.get(tVal));
        }
        return res
    }

    public fullLength(): number{
        return this.lengthAtT(1);
    }

    public lengthAtT(tVal: number): number{
        this.validateTVal(tVal);
        const z = tVal / 2, len = T.length;
        let sum = 0;
        for (let i = 0, t: number; i < len; i++) {
            t = z * T[i] + z;
            sum += C[i] * PointCal.magnitude(this.derivative(t));
        }
        return z * sum;
    }

    public derivative(tVal: number): Point{
        return this.computeWithControlPoints(tVal, this.dControlPoints);
    }

    public derivativeNormalized(tVal: number): Point{
        return PointCal.unitVector(this.computeWithControlPoints(tVal, this.dControlPoints));
    }

    public getArcLengthLUT(steps: number = 100): number[]{
        let res = [];
        let tSteps = 1 / steps;
        for(let tVal = 0; tVal <= 1; tVal += tSteps){
            if (tVal > 1){
                break;
            }
            res.push(this.lengthAtT(tVal));
        }
        return res;
    }

    public split(tVal: number, tVal2?: number): Point[][]{
        this.validateTVal(tVal);
        if (this.controlPoints.length == 3){
            let newControlPoint1 = this.controlPoints[0];
            let newControlPoint2 = PointCal.subVector(PointCal.multiplyVectorByScalar(this.controlPoints[1], tVal), PointCal.multiplyVectorByScalar(this.controlPoints[0], tVal - 1));
            let newControlPoint3 = PointCal.subVector(PointCal.multiplyVectorByScalar(this.controlPoints[2], tVal * tVal), PointCal.multiplyVectorByScalar(this.controlPoints[1], 2 * tVal * (tVal - 1)));
            newControlPoint3 = PointCal.addVector(newControlPoint3, PointCal.multiplyVectorByScalar(this.controlPoints[0], (tVal - 1) * (tVal - 1)));
            let newControlPoint4 = PointCal.subVector(PointCal.multiplyVectorByScalar(this.controlPoints[2], tVal), PointCal.multiplyVectorByScalar(this.controlPoints[1], tVal - 1));
            let newControlPoint5 = this.controlPoints[2];
            return [[newControlPoint1, newControlPoint2, newControlPoint3], [newControlPoint3, newControlPoint4, newControlPoint5]];
        }
        let newControlPoint1 = this.controlPoints[0];
        let newControlPoint2 = PointCal.subVector(PointCal.multiplyVectorByScalar(this.controlPoints[1], tVal), PointCal.multiplyVectorByScalar(this.controlPoints[0], (tVal - 1)));
        let newControlPoint3 = PointCal.addVector(PointCal.multiplyVectorByScalar(this.controlPoints[2], tVal * tVal), PointCal.addVector(PointCal.multiplyVectorByScalar(this.controlPoints[1], -(2 * tVal * (tVal - 1))), PointCal.multiplyVectorByScalar(this.controlPoints[0], (tVal - 1) * (tVal - 1))));
        let term1 = PointCal.multiplyVectorByScalar(this.controlPoints[3], tVal * tVal * tVal);
        let term2 = PointCal.multiplyVectorByScalar(this.controlPoints[2], -(3 * tVal * tVal * (tVal - 1)));
        let term3 = PointCal.multiplyVectorByScalar(this.controlPoints[1], 3 * tVal * (tVal - 1) * (tVal - 1));
        let term4 = PointCal.multiplyVectorByScalar(this.controlPoints[0], -((tVal - 1) * (tVal - 1) * (tVal - 1)));
        let newControlPoint4 = PointCal.addVector(term4, PointCal.addVector(term3, PointCal.addVector(term1, term2)));
        let newControlPoint5 = PointCal.addVector(PointCal.addVector(PointCal.multiplyVectorByScalar(this.controlPoints[3], tVal * tVal), PointCal.multiplyVectorByScalar(this.controlPoints[2], -(2 *  tVal * (tVal - 1)))), PointCal.multiplyVectorByScalar(this.controlPoints[1], (tVal - 1) * (tVal - 1)));
        let newControlPoint6 = PointCal.addVector(PointCal.multiplyVectorByScalar(this.controlPoints[3], tVal), PointCal.multiplyVectorByScalar(this.controlPoints[2], -(tVal - 1)));
        let newControlPoint7 = this.controlPoints[3];

        return [[newControlPoint1, newControlPoint2, newControlPoint3, newControlPoint4], [newControlPoint4, newControlPoint5, newControlPoint6, newControlPoint7]];
    }

    public findArcs(errorThreshold: number){
        let low = 0;
        const res: {center: Point, radius: number, startPoint: Point, startT: number, endPoint: Point, endT: number}[] = [];

        while (low < 1){
            let loopRes = this.findArcStartingAt(errorThreshold, low);
            if (loopRes == null || loopRes.arc == undefined) {
                break;
            }
            res.push(loopRes.arc);
            low = loopRes.arc.endT;
            if(low >= 1){
                break;
            }
        }
        return res;
    }

    public findArcStartingAt(errorThreshold: number, low: number){
        let high = 1;
        let mid = low + (high - low) / 2;
        let prevArc:{good: boolean, arc?: {center: Point, radius: number, startPoint: Point, endPoint: Point, startT: number, endT: number}} = {good: false};
        let count = 0;
        while(true){
            count++;
            mid = low + (high - low) / 2;
            if (high > 1 || mid > 1){
                if (prevArc.good){
                    return prevArc;
                } else {
                    return null;
                }
                
            }
            const lowPoint = this.get(low);
            const highPoint = this.get(high);
            const midPoint = this.get(mid);
            const fitArcRes = this.fitArc(lowPoint, highPoint, midPoint);
            if (!fitArcRes.exists || fitArcRes.center == null || fitArcRes.radius == null){
                return null;
            }
            const n = high - mid;
            const e1 = mid -  n / 2;
            const e2 = mid + n / 2;
            const checkPoint1 = this.get(e1);
            const checkPoint2 = this.get(e2);
            const checkRadius = PointCal.distanceBetweenPoints(checkPoint1, fitArcRes.center);
            const checkRadius2 = PointCal.distanceBetweenPoints(checkPoint2, fitArcRes.center);
            if (Math.abs(checkRadius - fitArcRes.radius) > errorThreshold || Math.abs(checkRadius2 - fitArcRes.radius) > errorThreshold){
                // arc is bad
                if (prevArc.good == true){
                    return prevArc;
                }
                prevArc.good = false;
                high = mid
            } else {
                prevArc.good = true;
                if (fitArcRes.startPoint !== undefined && fitArcRes.endPoint !== undefined){
                    prevArc.arc = { center: fitArcRes.center, radius: fitArcRes.radius, startPoint: fitArcRes.startPoint, endPoint: fitArcRes.endPoint, startT: low, endT: high};
                }
                high = high + (mid - low);
            }
        }
    }

    public fitArc(startPoint: Point, endPoint: Point, midPoint: Point): {exists: boolean, center?: Point, radius?: number, startPoint?: Point, endPoint?: Point}{
        const M11 = [[startPoint.x, startPoint.y, 1], [midPoint.x, midPoint.y, 1], [endPoint.x, endPoint.y, 1]];
        if (this.determinant3by3(M11) == 0) {
            // three points lie on a line no circle
            return {exists: false};
        }
        const M12 = [[startPoint.x * startPoint.x + startPoint.y * startPoint.y, startPoint.y, 1], 
                     [midPoint.x * midPoint.x + midPoint.y * midPoint.y, midPoint.y, 1],
                     [endPoint.x * endPoint.x + endPoint.y * endPoint.y, endPoint.y, 1]];
        const M13 = [[startPoint.x * startPoint.x + startPoint.y * startPoint.y, startPoint.x, 1],
                     [midPoint.x * midPoint.x + midPoint.y * midPoint.y, midPoint.x, 1],
                     [endPoint.x * endPoint.x + endPoint.y * endPoint.y, endPoint.x, 1]];
        const M14 = [[startPoint.x * startPoint.x + startPoint.y * startPoint.y, startPoint.x, startPoint.y],
                     [midPoint.x * midPoint.x + midPoint.y * midPoint.y, midPoint.x, midPoint.y],
                     [endPoint.x * endPoint.x + endPoint.y * endPoint.y, endPoint.x, endPoint.y]]
        const centerX = (1 / 2) * (this.determinant3by3(M12) / this.determinant3by3(M11));
        const centerY = (-1 / 2) * (this.determinant3by3(M13) / this.determinant3by3(M11));
        const radius = Math.sqrt(centerX * centerX + centerY * centerY + (this.determinant3by3(M14) / this.determinant3by3(M11)))
        return {exists: true, center: {x: centerX, y:centerY}, radius: radius, startPoint: startPoint, endPoint: endPoint};
    }

    public determinant3by3(matrix: number[][]): number{
        const a = matrix[0][0];
        const b = matrix[0][1];
        const c = matrix[0][2];
        const d = matrix[1][0];
        const e = matrix[1][1];
        const f = matrix[1][2];
        const g = matrix[2][0];
        const h = matrix[2][1];
        const i = matrix[2][2];
        return a * (e * i - f * h) - b * (d * i - g * f) + c * (d * h - e * g);
    }

    public curvature(tVal: number): number{
        const derivative = this.computeWithControlPoints(tVal, this.dControlPoints);
        const secondDerivative = this.computeWithControlPoints(tVal, this.getDerivativeControlPoints(this.dControlPoints));
        const numerator = derivative.x * secondDerivative.y - secondDerivative.x * derivative.y;
        const denominator = Math.pow(derivative.x * derivative.x + derivative.y * derivative.y, 3 / 2);
        if (denominator == 0) return NaN;
        return numerator / denominator;
    }

    public getCoefficientOfTTerms(): Point[]{
        return this.getCoefficientOfTTermsWithControlPoints(this.controlPoints);
    }

    public getDerivativeCoefficients(): Point[]{
        return this.getCoefficientOfTTermsWithControlPoints(this.dControlPoints);
    }

    public getCoefficientOfTTermsWithControlPoints(controlPoints: Point[]): Point[]{
        const terms: Point[] = [];
        let matrix: number[][] = [];
        if(controlPoints.length == 3){
            matrix = [[1, 0, 0], [-2, 2, 0], [1, -2, 1]];
        } else if (controlPoints.length == 4){
            matrix = [[1, 0, 0, 0], [-3, 3, 0, 0], [3, -6, 3, 0], [-1, 3, -3, 1]];
        } else if(controlPoints.length == 2){
            matrix = [[1, 0], [-1, 1]];
        } 
        else {
            throw new Error("number of control points is wrong");
        }
        for(let index = 0; index < controlPoints.length; index++){
            terms.push(controlPoints.reduce((prevVal, curVal, jindex)=>{
                return {x: prevVal.x + matrix[index][jindex] * curVal.x, y: prevVal.y + matrix[index][jindex] * curVal.y};
            }, {x: 0, y: 0}));
        }
        return terms;
    }

    private cuberoot(x: number) {
        var y = Math.pow(Math.abs(x), 1/3);
        return x < 0 ? -y : y;
    }
    
    public solveCubic(a: number, b: number, c: number, d: number) {
        if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
            a = b; b = c; c = d;
            if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
                a = b; b = c;
                if (Math.abs(a) < 1e-8) // Degenerate case
                    return [];
                return [-b/a];
            }
    
            let D = b*b - 4*a*c;
            if (Math.abs(D) < 1e-8)
                return [-b/(2*a)];
            else if (D > 0)
                return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
            return [];
        }
    
        // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
        let p = (3*a*c - b*b)/(3*a*a);
        let q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
        let roots: number[];
    
        if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
            roots = [this.cuberoot(-q)];
        } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
            roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
        } else {
            let D = q*q/4 + p*p*p/27;
            if (Math.abs(D) < 1e-8) {       // D = 0 -> two roots
                roots = [-1.5*q/p, 3*q/p];
            } else if (D > 0) {             // Only one real root and two complex roots
                let u = this.cuberoot(-q/2 - Math.sqrt(D));
                let v = this.cuberoot(-q/2 + Math.sqrt(D));
                //console.log("Complext Root 1 real:", -(u+v)/2.0 - a / 3.0, "imaginary:", Math.sqrt(3) / 2.0 * (v - u));
                //console.log("Complext Root 2 real:", -(u+v)/2.0 - a / 3.0, "imaginary:",-1 * Math.sqrt(3) / 2.0 * (v - u));
    
                roots = [u - p/(3*u)];
            } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
                let u = 2*Math.sqrt(-p/3);
                let t = Math.acos(3*q/p/u)/3;  // D < 0 implies p < 0 and acos argument in [-1..1]
                let k = 2*Math.PI/3;
                roots = [u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k)];
            }
        }
    
        // Convert back from depressed cubic
        for (let i = 0; i < roots.length; i++)
            roots[i] -= b/(3*a);
    
        return roots;
    }

    getControlPointsAlignedWithXAxis(){
        const alignedAxis = PointCal.unitVectorFromA2B(this.controlPoints[0], this.controlPoints[this.controlPoints.length - 1]);
        const angle = PointCal.angleFromA2B({x:1, y:0}, alignedAxis);
        const startingPoint = this.controlPoints[0];
        const res = [{x: 0, y: 0}];
        for(let index = 1; index < this.controlPoints.length; index++){
            const vector = PointCal.subVector(this.controlPoints[index], startingPoint);
            const rotatedVector = PointCal.rotatePoint(vector, -angle);
            res.push(rotatedVector);
        }
        return res;
    }

    approximately (a: number, b: number, precision?: number) {
        const epsilon = 0.000001
        return Math.abs(a - b) <= (precision || epsilon);
    }

    getExtrema():{x: number[], y: number[]}{
        const res: {x: number[], y: number[]} = {x: [], y: []};
        const derivativeCoefficients = this.getDerivativeCoefficients();
        let xCoefficients = [0, 0, 0, 0];
        let yCoefficients = [0, 0, 0, 0];
        derivativeCoefficients.forEach((coefficient, index)=>{
            xCoefficients[3 - index] = coefficient.x;
            yCoefficients[3 - index] = coefficient.y;
        });

        const xRoots = this.solveCubic(xCoefficients[0], xCoefficients[1], xCoefficients[2], xCoefficients[3]);
        const yRoots = this.solveCubic(yCoefficients[0], yCoefficients[1], yCoefficients[2], yCoefficients[3]);
        xRoots.forEach((root)=>{
            if(root >= 0 && root <= 1){
                res.x.push(root);
            }
        });
        yRoots.forEach((root)=>{
            if(root >= 0 && root <= 1){
                res.y.push(root);
            }
        });
        
        if(derivativeCoefficients.length >= 3){
            xCoefficients = [0, 0, 0, 0];
            yCoefficients = [0, 0, 0, 0];
            const secondDerivativeCoefficients = this.getCoefficientOfTTermsWithControlPoints(this.getDerivativeControlPoints(this.dControlPoints));
            secondDerivativeCoefficients.forEach((coefficient, index)=>{
                xCoefficients[3 - index] = coefficient.x;
                yCoefficients[3 - index] = coefficient.y;
            })
            const secondXRoots = this.solveCubic(xCoefficients[0], xCoefficients[1], xCoefficients[2], xCoefficients[3]);
            const secondYRoots = this.solveCubic(yCoefficients[0], yCoefficients[1], yCoefficients[2], yCoefficients[3]);
            secondXRoots.forEach((root)=>{
                if(root >= 0 && root <= 1){
                    res.x.push(root);
                }
            });
            secondYRoots.forEach((root)=>{
                if(root >= 0 && root <= 1){
                    res.y.push(root);
                }
            });

        }
        return res;        
    }

    translateRotateControlPoints(translation: Point, rotationAngle: number){
        // rotation is in radians
        const res: Point[] = [];
        for(let index = 0; index < this.controlPoints.length; index++){
            res.push(PointCal.rotatePoint(PointCal.addVector(this.controlPoints[index], translation), rotationAngle));
        }
        return res;
    }

    getLineIntersections(line: Line): number[]{
        const translationRotation = line.getTranslationRotationToAlginXAxis();
        const res: number[] = [];
        const alignedControlPoints = this.translateRotateControlPoints(translationRotation.translation, translationRotation.rotationAngle);
        const coefficients = this.getCoefficientOfTTermsWithControlPoints(alignedControlPoints);
        let yCoefficients = [0, 0, 0, 0];
        coefficients.forEach((coefficient, index)=>{
            yCoefficients[3 - index] = coefficient.y;
        });

        const yRoots = this.solveCubic(yCoefficients[0], yCoefficients[1], yCoefficients[2], yCoefficients[3]);
        yRoots.forEach((root)=>{
            if(root >= 0 && root <= 1){
                res.push(root);
            }
        });

        return res;
    }

    getSelfIntersections(): {selfT: number, otherT: number}[]{
        const [subCurveControlPoints1, subCurveControlPoints2] = this.split(0.5);
        const subCurve1 = new bCurve(subCurveControlPoints1);
        const subCurve2 = new bCurve(subCurveControlPoints2);
        let initialRes = this.getIntersectionsBetweenCurves(subCurve1, subCurve2);
        initialRes.forEach((intersection)=>{
            intersection.selfT = intersection.selfT * 0.5;
            intersection.otherT = intersection.otherT * 0.5 + 0.5;
        });
        initialRes.shift();
        return initialRes;
    }

    getIntersectionsBetweenCurves(curve: bCurve, curve2: bCurve): {selfT: number, otherT: number}[]{
        const threshold = 0.0001;
        let pairs: {curve1: {curve: bCurve, startTVal: number, endTVal: number}, curve2: {curve: bCurve, startTVal: number, endTVal: number}}[] = [{curve1: {curve: curve, startTVal: 0, endTVal: 1}, curve2: {curve: curve2, startTVal: 0, endTVal: 1}}];
        const finalRes = [];
        while (pairs.length > 0){
            let curLength = pairs.length;
            for(let index = 0; index < curLength; index++){
                let pair = pairs.shift();
                if (pair == undefined){
                    break;
                }
                let aabb1 = pair.curve1.curve.getAABB();
                let aabb2 = pair.curve2.curve.getAABB();
                let intersects = this.AABBIntersects(aabb1, aabb2);
                if(pair.curve1.curve.fullLength() < threshold && pair.curve2.curve.fullLength() < threshold){
                    finalRes.push({intersection: pair.curve1.curve.get(0.5), tVal1: (pair.curve1.startTVal + pair.curve1.endTVal) * 0.5, tVal2: (pair.curve2.startTVal + pair.curve2.endTVal) * 0.5});
                    continue;
                }
                if (intersects){
                    let [subCurveControlPoints1, subCurveControlPoints2] = pair.curve1.curve.split(0.5);
                    let [subCurveControlPoints3, subCurveControlPoints4] = pair.curve2.curve.split(0.5);
                    pairs.push({
                        curve1: {
                            curve: new bCurve(subCurveControlPoints1), 
                            startTVal: pair.curve1.startTVal, 
                            endTVal: pair.curve1.startTVal + (pair.curve1.endTVal - pair.curve1.startTVal) * 0.5
                    }, curve2: {
                            curve: new bCurve(subCurveControlPoints3),
                            startTVal: pair.curve2.startTVal,
                            endTVal: pair.curve2.startTVal + (pair.curve2.endTVal - pair.curve2.startTVal) * 0.5
                    }});

                    pairs.push({
                        curve1: {
                            curve: new bCurve(subCurveControlPoints1), 
                            startTVal: pair.curve1.startTVal, 
                            endTVal: pair.curve1.startTVal + (pair.curve1.endTVal - pair.curve1.startTVal) * 0.5
                    }, curve2: {
                            curve: new bCurve(subCurveControlPoints4),
                            startTVal: pair.curve2.startTVal + (pair.curve2.endTVal - pair.curve2.startTVal) * 0.5,
                            endTVal: pair.curve2.endTVal
                    }});

                    pairs.push({
                        curve1: {
                            curve: new bCurve(subCurveControlPoints2), 
                            startTVal: pair.curve1.startTVal + (pair.curve1.endTVal - pair.curve1.startTVal) * 0.5 ,
                            endTVal: pair.curve1.endTVal 
                    }, curve2: {
                            curve: new bCurve(subCurveControlPoints3),
                            startTVal: pair.curve2.startTVal,
                            endTVal: pair.curve2.startTVal + (pair.curve2.endTVal - pair.curve2.startTVal) * 0.5
                    }});

                    pairs.push({
                        curve1: {
                            curve: new bCurve(subCurveControlPoints2), 
                            startTVal: pair.curve1.startTVal + (pair.curve1.endTVal - pair.curve1.startTVal) * 0.5 ,
                            endTVal: pair.curve1.endTVal 
                    }, curve2: {
                            curve: new bCurve(subCurveControlPoints4),
                            startTVal: pair.curve2.startTVal + (pair.curve2.endTVal - pair.curve2.startTVal) * 0.5,
                            endTVal: pair.curve2.endTVal
                    }});
                }

            }
        }

        const tVals: {selfT: number, otherT: number}[] = [];
        const tVal1s: number[] = [];
        finalRes.forEach((intersections)=>{
            let within = false;
            for(let index = 0; index < tVal1s.length; index++){
                if (this.approximately(intersections.tVal1, tVal1s[index], 0.000005)){
                    within = true;
                    break;
                }
            }
            if (!within){
                tVal1s.push(intersections.tVal1);
                tVals.push({selfT: intersections.tVal1, otherT: intersections.tVal2});
            }
        });
        return tVals;
    }

    getCurveIntersections(curve: bCurve): {selfT: number, otherT: number}[]{
        return this.getIntersectionsBetweenCurves(this, curve);
    }

    AABBIntersects(AABB1: {min: Point, max: Point}, AABB2: {min: Point, max: Point}): boolean{
        if ((AABB1.min.x <= AABB2.max.x && AABB2.min.x <= AABB1.max.x) && (AABB1.min.y <= AABB2.max.y && AABB2.min.y <= AABB1.max.y)){
            return true;
        }
        return false;
    }

    

    // A helper function to filter for values in the [0,1] interval:
    accept(t: number) {
        return 0 <= t && t <=1;
    }
  
    // A real-cuberoots-only function:
    cuberoot2(v:number) {
        if(v<0) return -Math.pow(-v,1/3);
        return Math.pow(v,1/3);
    }
  
    // Now then: given cubic coordinates {pa, pb, pc, pd} find all roots.
    getCubicRoots(pa: number, pb: number, pc: number, pd: number) {
        let a = (3*pa - 6*pb + 3*pc),
            b = (-3*pa + 3*pb),
            c = pa,
            d = (-pa + 3*pb - 3*pc + pd);

        // do a check to see whether we even need cubic solving:
        if (this.approximately(d,0)) {
            // this is not a cubic curve.
            if (this.approximately(a,0)) {
                // in fact, this is not a quadratic curve either.
                if (this.approximately(b,0)) {
                    // in fact in fact, there are no solutions.
                    return [];
                }
                // linear solution
                return [-c / b].filter(this.accept);
            }
            // quadratic solution
            let q = Math.sqrt(b*b - 4*a*c), a2 = 2*a;
            return [(q-b)/a2, (-b-q)/a2].filter(this.accept)
        }

        // at this point, we know we need a cubic solution.

        a /= d;
        b /= d;
        c /= d;

        let p = (3*b - a*a)/3,
            p3 = p/3,
            q = (2*a*a*a - 9*a*b + 27*c)/27,
            q2 = q/2,
            discriminant = q2*q2 + p3*p3*p3;

        // and some variables we're going to use later on:
        let u1, v1, root1, root2, root3;

        // three possible real roots:
        if (discriminant < 0) {
            let mp3  = -p/3,
            mp33 = mp3*mp3*mp3,
            r    = Math.sqrt( mp33 ),
            t    = -q / (2*r),
            cosphi = t<-1 ? -1 : t>1 ? 1 : t,
            phi  = Math.acos(cosphi),
            crtr = this.cuberoot2(r),
            t1   = 2*crtr;
            root1 = t1 * Math.cos(phi/3) - a/3;
            root2 = t1 * Math.cos((phi+2*Math.PI)/3) - a/3;
            root3 = t1 * Math.cos((phi+4*Math.PI)/3) - a/3;
            return [root1, root2, root3].filter(this.accept);
        }

        // three real roots, but two of them are equal:
        if(discriminant === 0) {
            u1 = q2 < 0 ? this.cuberoot2(-q2) : -this.cuberoot2(q2);
            root1 = 2*u1 - a/3;
            root2 = -u1 - a/3;
            return [root1, root2].filter(this.accept);
        }

        // one real root, two complex roots
        var sd = Math.sqrt(discriminant);
        u1 = this.cuberoot2(sd - q2);
        v1 = this.cuberoot2(sd + q2);
        root1 = u1 - v1 - a/3;
        return [root1].filter(this.accept);
    }

    public getAABB():{min: Point, max: Point}{
        const extrema = this.getExtrema();
        const tVals = [0, 1];
        let min: Point = {x: Number.MAX_VALUE, y: Number.MAX_VALUE};
        let max: Point = {x: -Number.MAX_VALUE, y: -Number.MAX_VALUE};
        extrema.x.forEach((tVal)=>{
            tVals.push(tVal);
        });
        extrema.y.forEach((tVal)=>{
            tVals.push(tVal);
        });
        tVals.forEach((tVal)=>{
            const curPoint = this.get(tVal);
            min.x = Math.min(min.x, curPoint.x);
            min.y = Math.min(min.y, curPoint.y);
            max.x = Math.max(max.x, curPoint.x);
            max.y = Math.max(max.y, curPoint.y);
        });

        return {min:min, max:max};
    }

}

export class TValOutofBoundError extends Error{
constructor(message: string){
    super(message);
    }
}

export type Point = {
    x: number;
    y: number;
    z?: number;
}