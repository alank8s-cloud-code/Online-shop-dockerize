import Modal from 'react-modal';
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";
import {useShoppingItems} from "../../context/ShoppingItemsContext.jsx";
import {toast} from 'react-toastify';
import {Zoom, Flip} from 'react-toastify';
import {Tooltip} from "react-tooltip";
import InProgressToastContent from "../InProgressToastContent.jsx";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        border: '0',
        borderRadius: 'var(--bs-border-radius)',
        boxShadow: 'var(--bs-box-shadow-lg)'
    },
};

export default function UpdateProductModal({modalIsOpen, closeModal, itemToUpdate})
{
    const [name, setName] = useState(itemToUpdate?.name ?? '')
    const [price, setPrice] = useState(itemToUpdate?.price ?? '')
    const [imageUrl, setImageUrl] = useState(itemToUpdate?.imgUrl ?? '')
    const {updateProduct} = useShoppingItems();
    const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false)

    // Keep track of the previously seen item so we can detect when a *different*
    // item is being edited, and re-seed the form fields for it. This replaces the
    // old "sync state from prop in an effect" pattern, which triggers cascading
    // renders (react-hooks/set-state-in-effect).
    const [prevItemToUpdate, setPrevItemToUpdate] = useState(itemToUpdate);
    if (itemToUpdate !== prevItemToUpdate)
    {
        setPrevItemToUpdate(itemToUpdate);
        if (itemToUpdate)
        {
            setName(itemToUpdate.name);
            setPrice(itemToUpdate.price);
            setImageUrl(itemToUpdate.imgUrl);
        }
    }

    if (!itemToUpdate) return null;

    // noinspection EqualityComparisonWithCoercionJS
    // Derived value, computed during render instead of stored in its own state +
    // effect (react-hooks/set-state-in-effect / "you might not need an effect").
    const isDataIdentical =
        itemToUpdate.name === name &&
        itemToUpdate.price == price &&
        itemToUpdate.imgUrl === imageUrl;

    const updateExistingProduct = async (e) =>
    {
        e.preventDefault();

        const toastId = toast(
            <InProgressToastContent icon={faSpinner} text='Update in progress...'/>,
            {autoClose: false, closeButton: false})

        setSubmitBtnDisabled(true);

        const error = await updateProduct(itemToUpdate.id, {
            name: name,
            price: price,
            imgUrl: imageUrl
        });

        setSubmitBtnDisabled(false);

        if (error)
        {
            toast.update(toastId,
                {
                    type: 'error',
                    autoClose: false,
                    render: "Error updating product: " + error.message,
                    transition: Zoom,
                    closeButton: true
                })

            return;
        }

        toast.update(toastId,
            {
                type: 'success',
                autoClose: 1500,
                render: 'Product updated successfully!',
                transition: Flip,
                closeButton: true
            })

        closeModal();
    };

    return (
        <Modal
            ariaHideApp={false}
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Update Product Modal"
        >
            <div className='d-flex justify-content-between align-items-center'>
                <h4 className='m-0'>Update Product</h4>
                <Button className='rounded-circle' variant='outline-dark' onClick={closeModal}>
                    <FontAwesomeIcon icon={faXmark}/></Button>
            </div>

            <form autoComplete='off' onSubmit={updateExistingProduct} className='d-flex flex-column gap-3 pt-3'>

                <div className="form-group">
                    <label htmlFor="productNameInput">Name</label>
                    <input type="text"
                           className="form-control"
                           id="productNameInput"
                           placeholder="Banana"
                           autoComplete='off'
                           required
                           value={name}
                           onChange={(e) => setName(e.target.value)}/>
                </div>

                <div className="form-group">
                    <label htmlFor="newProductPriceInput">Price</label>
                    <input type="number"
                           className="form-control"
                           id="newProductPriceInput"
                           autoComplete='off'
                           placeholder="$2.99"
                           min="1"
                           step="any"
                           required
                           value={price}
                           onChange={(e) => setPrice(e.target.value)}/>
                </div>

                <div className="form-group">
                    <label htmlFor="newProductImageUrlInput">Image URL</label>
                    <input type="url"
                           className="form-control"
                           id="newProductImageUrlInput"
                           autoComplete='off'
                           value={imageUrl}
                           onChange={(e) => setImageUrl(e.target.value)}
                           placeholder="https://banana.image.url"/>
                </div>

                {/* The button is wrapped around a div because tooltips can't be shown on disabled buttons. */}
                <div data-tooltip-id='update-product-modal=submit-btn'>
                    <button disabled={submitBtnDisabled || isDataIdentical}
                            type="submit" className="btn btn-primary w-100">Update
                    </button>
                </div>
                {isDataIdentical &&
                    <Tooltip id="update-product-modal=submit-btn">No changes have been made.</Tooltip>}
            </form>
        </Modal>
    );
}