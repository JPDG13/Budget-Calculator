var budgetController = (function() {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;

	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0,
		},

		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			//Creat a new ID = to last ID + 1 (so there are no errors, when items are deleted)
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0;
			};
			//Create new item, income or expense.
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			// Push it into our data structure
			data.allItems[type].push(newItem);
			// Return the new element
			return newItem; 
		},

		deleteItem: function(type, id) {
			var ids, index;
			//Maps inc or exp into an array, and deletes the selected index
			//Map returns a brand new array
			var ids = data.allItems[type].map(function(current) {
				return current.id; 
			});

			index = ids.indexOf(id);
			//Removes the specific item at the index.
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			// Calculates income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			// Calculates income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			// Calculates percentage of income spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function() {
			console.log(data);
		}
	};

})(); 

var UIController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
			var numSplit, int, dec, type;
			// Number is rounded properly
			num = Math.abs(num);
			// .00 decimals, number in function is the number after decimal.
			num = num.toFixed(2);
			// splits the number via .
			numSplit = num.split('.')
			// comma for numbers in the thousands
			int = numSplit[0];
			if (int.length > 3) {
				int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, 3);
			} 

			dec = numSplit[1];
			// if it's an expense, use the - sign, otherwise, use + sign
			return (type === 'exp' ? sign = '-' : '+') + ' ' + int + '.' + dec;
		};

	var nodeListForEach = function(list, callback) {
			for (i = 0; i < list.length; i++) {
				callback(list[i], i);
			}
		};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, // Either income or expense.
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			
			var html, newHtml, element;
			// Create HTML string with text
			if(type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			// Replace the text with data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			// Insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID) {
			//Removes the child element from the parent element
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		displayBudget: function(obj) {

			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
 
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {
			//This returns a node list
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},
		
		displayMonth: function() {
			var now, months, month, year;
			now = new Date();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
			'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue);
				
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		// This makes the DOMstrings publically available. 
		getDOMstrings: function() {
			return DOMstrings;
		}
	};

})();

var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {
		// This calls to the DOMstrings
		var DOM = UICtrl.getDOMstrings();
		//This is our green checkmark button.  
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		//Same thing, but using the return key
		document.addEventListener('keypress', function(event) {
			//Keycode 13 is Enter.  Event.which is for older browsers. 
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {

		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		// 2. Returns the budget
		var budget = budgetCtrl.getBudget();
		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {

		// 1. calc percentages
		budgetCtrl.calculatePercentages();
		// 2. Read them from the budget controller
		var percentages = budgetCtrl.getPercentages();
		// 3. Update the UI with new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function(){
		var input, newItem;

		// 1) get field input data
		input = UICtrl.getInput();
		
		if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add item to budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			// 3. Add the new item to UI
			UICtrl.addListItem(newItem, input.type);
			// 4. Clear fields
			UICtrl.clearFields();
			// 5. Calc and update budget
			updateBudget();
			//6. Calc and update percentages
			updatePercentages();
		}
	};

	// Deletes a listed item. 
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {

			// inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			// 1. Delete item from data structure
			budgetCtrl.deleteItem(type, ID);
			// 2. Delete item from UI
			UICtrl.deleteListItem(itemID);
			// 3. Update and show new budget
			updateBudget();
			// 4. Calc and update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			console.log('App has started.');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

controller.init();