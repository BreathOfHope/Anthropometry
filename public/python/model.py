from tensorflow.keras.models import Model
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense
import config
import warnings

warnings.filterwarnings("ignore")

def get_age_model():

    age_model = ResNet50(
        include_top=False,
        weights='imagenet',
        input_shape=(config.RESNET50_DEFAULT_IMG_WIDTH, config.RESNET50_DEFAULT_IMG_WIDTH, 3),
        pooling='avg'
    )

    prediction = Dense(units=101,
                       kernel_initializer='he_normal',
                       use_bias=False,
                       activation='softmax',
                       name='pred_age')(age_model.output)

    age_model = Model(inputs=age_model.input, outputs=prediction)
    return age_model


def get_model():

    base_model = get_age_model()
    last_hidden_layer = base_model.get_layer(index=-2)

    base_model = Model(
        inputs=base_model.input,
        outputs=last_hidden_layer.output)
    prediction = Dense(1, kernel_initializer='normal')(base_model.output)

    model = Model(inputs=base_model.input, outputs=prediction)
    return model