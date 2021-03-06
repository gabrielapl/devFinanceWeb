const Modal = {
  open(){
    document.querySelector(".modal-overlay")
    .classList.add("active")
    
  },
  close(){
    document.querySelector(".modal-overlay")
    .classList.remove("active")
  }
}

const Storage = {
  get(){
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transaction){
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))
  },
}


const Transaction = {
  all: Storage.get(),

  add(transaction){
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index){
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes(){
    let income = 0;

    Transaction.all.forEach(transactions => {
      if(transactions.amount > 0){
        income += transactions.amount;
      }
    });

    return income;
  },
  expenses(){
    let expense = 0;

    Transaction.all.forEach(transactions => {
      if(transactions.amount < 0){
        expense += transactions.amount;
      }
    });

    return expense;
  },
  total(){
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index){
    const tr = document.createElement("tr")
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index){

    const CssClass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount)

    const html = 
    `
        <td class="descriptions">${transaction.description}</td>
        <td class="${CssClass}">${amount}</td>
        <td>${transaction.date}</td>
        <td>
          <img src="assets/minus.svg" onclick="Transaction.remove(${index})" alt="Remover Transação">
        </td>
    `
    return html
  },
  updateBalance(){
    document.getElementById("incomesDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());
    document.getElementById("expensesDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses());
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
  },
  clearTransactions(){
    DOM.transactionsContainer.innerHTML = ""
  }

}

const Utils = {
  formatCurrency(value){
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
    return signal + value;
  },

  formatAmount(value){
    //forma de tirar . e ,
    //value = Number(value.replace(/\,\./g, "")) * 100
    value = Number(value) * 100
    return value
  },

  formatDate(date){
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

}

const Form = {

  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues(){
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },


  validateFields(){
    const { amount, date, description  } = Form.getValues();

    //trim limpa os espaço vazios
    if(description.trim() === "" || 
    amount.trim() === "" || 
    date.trim() === ""){
      throw new Error("Por favor, preencha todos os campos")
    }

  },

  FormatValues(){
    let { amount, date, description  } = Form.getValues();
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    return {
      description,
      amount,
      date
    }
  },

  clearField(){
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event){
    event.preventDefault()

    try {

      Form.validateFields()
      const transaction = Form.FormatValues()
      Transaction.add(transaction)
      Form.clearField()
      Modal.close()
      App.reload()

    } catch (error) {
      alert(error.message)
    }
  }
}



const App = {
  init(){
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Storage.set(Transaction.all)
  },
  reload(){
    DOM.clearTransactions();
    App.init();
  }
}

App.init();