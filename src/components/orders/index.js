/* globals */
import React from 'react'
import { Link, Redirect } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import swal from 'sweetalert'
import moment from 'moment'

const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const handlerOnAddDocEventListener = function (eventObj) {
  console.error('handlerOnAddDocEventListener order index.js')
  const { error, /* document, foundation, */ data } = eventObj
  if (error) {
    console.error(`Error adding user: ${error}`)
    return
  }
  console.debug([data, ...this.state.orders])
  this.setState({ orders: [data, ...this.state.orders] })
}

const handlerOnEditDocEventListener = function (eventObj) {
  console.error('handlerOnEditDocEventListener order index.js')
  const { data, primaryKey, /* document, foundation, */ error } = eventObj
  if (error) {
    console.error(`Error updating user: ${error}`)
    return
  }
  const newData = this.state.orders.map((order) => {
    if (order.__id === primaryKey) {
      return data
    } else {
      return order
    }
  })
  console.debug([...newData])
  this.setState({ orders: [...newData] })
}

const handlerOnDeleteDocEventListener = function (eventObj) {
  console.error('handlerOnDeleteDocEventListener order index.js')
  const { error, /* document, foundation, */ data } = eventObj
  if (error) {
    console.error(`Error deleting user: ${error}`)
    return
  }
  const allOrders = [...this.state.orders]
  for (let x = 0; x < allOrders.length; x++) {
    const order = allOrders[x]
    if (order.__id === data.__id) {
      allOrders.splice(x)
    }
  }
  this.setState({ orders: allOrders })
}

/**
 * @author Eduardo Perotta de Almeida <web2solucoes@gmail.com>
 * @Component Orders
 * @description React component consuming a Order Data Entity collection to feed a grid
 * @extends React.Component
 */
class Orders extends React.Component {
  constructor (props) {
    super(props)
    // console.error('------>', props)
    /**
     * Entity name which this component represents to
     */
    this.entity = 'Order'
    /**
     * access to foundation instance
     */
    this.foundation = props.foundation
    /**
     * default pagination to list data
     */
    this.pagination = {
      offset: 0,
      limit: 30
    }
    /**
     * component state
     */
    this.state = {
      orders: []
    }
    this.onAddDocEventListener = null
    this.onEditDocEventListener = null
    this.onDeleteDocEventListener = null
    this.handleDeleteOrder = this.handleDeleteOrder.bind(this)
  }

  /**
   * @Method Orders.componentWillUnmount
   * @summary Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as cancelled network requests, or cleaning up any DOM elements created in componentDidMount.
   * @description lets stop listen to Order Data State Change Events
   * @example
componentWillUnmount() {
  const { Order } = this.foundation.data
  Order.stopListenTo(this.onAddDocEventListener)
  Order.stopListenTo(this.onEditDocEventListener)
  Order.stopListenTo(this.onDeleteDocEventListener)
}
   */
  componentWillUnmount () {
    const { Order } = this.foundation.data
    /**
     * Destroy event listeners of this component which are listening to Order collection
     * and react to it
     */
    Order.stopListenTo(this.onAddDocEventListener)
    Order.stopListenTo(this.onEditDocEventListener)
    Order.stopListenTo(this.onDeleteDocEventListener)
    this.onAddDocEventListener = null
    this.onEditDocEventListener = null
    this.onDeleteDocEventListener = null
  }

  /**
   * @async
   * @Method Orders.componentDidMount
   * @summary Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   * @description Once component is monted we are now ready to start listen to changes on Order data entity and get a list of order in database to fill out the state.orders
   * @example
componentDidMount() {
  const { Order } = this.foundation.data

  this.onAddDocEventListener = Order.on(
    'add',
    handlerOnAddDocEventListener.bind(this)
  )

  this.onEditDocEventListener = Order.on(
    'edit',
    handlerOnEditDocEventListener.bind(this)
  )

  this.onDeleteDocEventListener = Order.on(
    'delete',
    handlerOnDeleteDocEventListener.bind(this)
  )

  const { error, data } = await Order.find({}, { ...this.pagination })
  if (!error) {
    this.setState({ orders: orders.data })
  }
}
   */
  async componentDidMount () {
    const { Order } = this.foundation.data

    // listen to add, edit and delete events on Order collection
    // and react to it
    /**
     * listen to add Order Data Entity change event on Data API
     */
    this.onAddDocEventListener = Order.on('add', handlerOnAddDocEventListener.bind(this))

    /**
     * listen to edit Order Data Entity change event on Data API
     */
    this.onEditDocEventListener = Order.on('edit', handlerOnEditDocEventListener.bind(this))

    /**
     * listen to delete Order Data Entity change event on Data API
     */
    this.onDeleteDocEventListener = Order.on('delete', handlerOnDeleteDocEventListener.bind(this))

    // get Orders on database
    const orders = await Order.find({}, { ...this.pagination })
    console.warn(orders)

    if (orders.data) {
      this.setState({ orders: orders.data })
    }
  }

  /**
   * @Method Orders.handleDeleteOrder
   * @summary Event handler that Deletes a order
   * @description Once component is monted we are now ready to start listen to changes on Order data entity and get a list of order in database to fill out the state.orders
   * @param  {event} event - The HTML event triggered on User interation
   * @param  {number} __id - The primaryKey value of the record willing to be deleted
   * @example
handleDeleteOrder(e, ___id) {
  const { Order } = this.foundation.data
  e.preventDefault()
  swal({
    title: 'Are you sure?',
    text: 'Once deleted, you will not be able to recover this!',
    icon: 'warning',
    buttons: true,
    dangerMode: true
  }).then(async (willDelete) => {
    if (willDelete) {
      const r = await Order.delete(___id)
      if (r.error) {
        swal('Database error', e.error.message, 'error')
        return
      }
      swal('Poof! The order has been deleted!', {
        icon: 'success'
      })
      return <Redirect to = '/dashboard' / >
    } else {
      swal('The Order is safe!')
    }
  })
}

// <a color='primary' href='#' onClick={e => this.handleDeleteOrder(e, doc.__id)}>[delete]</a>
   */
  handleDeleteOrder (e, ___id) {
    const { Order } = this.foundation.data
    e.preventDefault()
    // console.error(___id)
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this!',
      icon: 'warning',
      buttons: true,
      dangerMode: true
    }).then(async (willDelete) => {
      if (willDelete) {
        const r = await Order.delete(___id)
        // console.error(r)
        if (r.error) {
          swal('Database error', e.error.message, 'error')
          return
        }
        swal('Poof! The order has been deleted!', {
          icon: 'success'
        })
        return <Redirect to='/dashboard' />
      } else {
        swal('The Order is safe!')
      }
    })
  }

  /**
   * @async
   * @Method Orders.render
   * @summary Component render function.
   * @description Renders a grid of Orders
   */
  render () {
    return (
      <main className='col-md-9 ms-sm-auto col-lg-10 px-md-4 main'>
        <div className='d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom'>
          <h1 className='h2'>Orders</h1>
          <div className='btn-toolbar mb-2 mb-md-0'>
            <div className='btn-group me-2'>
              <LinkContainer to='/OrdersAdd'>
                <button type='button' className='btn btn-sm btn-outline-secondary'>
                  Add new Order
                </button>
              </LinkContainer>
            </div>
          </div>
        </div>
        <div className='table-responsive'>
          <table className='table table-striped table-sm'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Ship to</th>
                <th>Payment method</th>
                <th align='right'>Amount</th>
                <th>-</th>
              </tr>
            </thead>
            <tbody>
              {this.state.orders.map((doc) => (
                <tr key={doc.id}>
                  <td>{moment(doc.date).subtract(6, 'days').calendar()}</td>
                  <td>{doc.name}</td>
                  <td>{doc.shipTo}</td>
                  <td>{doc.paymentMethod}</td>
                  <td align='right'>USD {formatter.format(doc.amount)}</td>
                  <td>
                    <a color='primary' href='#' onClick={e => this.handleDeleteOrder(e, doc.__id)}>[delete]</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

    )
  }
}

export default Orders
