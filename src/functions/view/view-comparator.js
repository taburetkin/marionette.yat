import _ from 'underscore';
import compareAB from './compare-ab';

/*
*	accepts:
*		variant #1: a, b, function
*		variant #2: [[a,b,function], [a,b,function]]
*		function can be undefined
*		example:
*			ascending	:		return viewComparator(viewA, viewB, function(model, view){ return model && model.get('someTextField') });
*			descending	:		return viewComparator(viewB, viewA, function(model, view){ return model && model.get('someTextField') });
			multiple compares: 	return viewComparator([[viewB, viewA, func], [viewB, viewA, func]])
*/
let viewComparator = (...args) => {
	var compareArray = [];
	var result = 0;

	if (args.length >= 2)	// single compare
		return compareAB.apply(null, args);
	else if (args.length === 1 && args[0] instanceof Array)	// array of compare
		compareArray = args[0];

	_(compareArray).every(function (singleCompare) {
		result = compareAB.apply(null, singleCompare);
		return result === 0;
	});
	
	return result;
}

export default viewComparator;
